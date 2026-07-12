from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course, EnrollmentRequest, Lesson
from .serializers import CourseSerializer, EnrollmentRequestSerializer, LessonSerializer
from core.moodle_api import get_course_contents, get_moodle_login_url

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing courses and fetching their content from Moodle.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def contents(self, request, pk=None):
        course = self.get_object()
        if not course.moodle_course_id:
            return Response(
                {"error": "This course is not linked to Moodle."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        contents = get_course_contents(course.moodle_course_id)
        if contents is None:
            return Response(
                {"error": "Failed to fetch contents from Moodle."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
        return Response(contents)

    @action(detail=True, methods=['get'])
    def sso_url(self, request, pk=None):
        course = self.get_object()
        user = request.user
        
        if not course.moodle_course_id:
             return Response({"error": "Course not linked to Moodle"}, status=400)
             
        login_url = get_moodle_login_url(user, course.moodle_course_id)
        if login_url:
            return Response({"login_url": login_url})
        return Response({"error": "Failed to generate SSO URL"}, status=500)

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user
        if not user.is_student or not hasattr(user, 'student_profile'):
            return Response({"detail": "Only students can enroll in courses."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already enrolled
        if course.students.filter(pk=user.student_profile.pk).exists():
            return Response({"detail": "You are already enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create enrollment request
        req, created = EnrollmentRequest.objects.get_or_create(
            student=user.student_profile,
            course=course,
            defaults={'status': 'pending'}
        )
        if not created:
            if req.status == 'approved':
                return Response({"detail": "You are already enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)
            elif req.status == 'pending':
                return Response({"detail": "Your enrollment request is already pending approval."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                # If previously rejected, allow them to re-request by setting it to pending
                req.status = 'pending'
                req.save()

        return Response(EnrollmentRequestSerializer(req, context={'request': request}).data, status=status.HTTP_201_CREATED)


class EnrollmentRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet to manage enrollment requests (listing, approving, rejecting).
    """
    queryset = EnrollmentRequest.objects.all()
    serializer_class = EnrollmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_tutor:
            # Return enrollment requests for courses taught by this tutor
            return EnrollmentRequest.objects.filter(course__tutor__user=user)
        elif user.is_student:
            # Return enrollment requests made by this student
            if hasattr(user, 'student_profile'):
                return EnrollmentRequest.objects.filter(student=user.student_profile)
            return EnrollmentRequest.objects.none()
        return super().get_queryset()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if not request.user.is_tutor:
            return Response({"detail": "Only tutors can approve requests."}, status=status.HTTP_403_FORBIDDEN)

        req = self.get_object()
        req.status = 'approved'
        req.save()

        # Add student to the course students list, which triggers the sync signal
        req.course.students.add(req.student)

        return Response(EnrollmentRequestSerializer(req, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if not request.user.is_tutor:
            return Response({"detail": "Only tutors can reject requests."}, status=status.HTTP_403_FORBIDDEN)

        req = self.get_object()
        req.status = 'rejected'
        req.save()

        # Remove student from course if they were added somehow
        req.course.students.remove(req.student)

        return Response(EnrollmentRequestSerializer(req, context={'request': request}).data)


from rest_framework.parsers import MultiPartParser, FormParser

class LessonViewSet(viewsets.ModelViewSet):
    """
    ViewSet to manage course lessons and upload video files.
    """
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        course_id = self.request.query_params.get('course')

        # Base queryset
        qs = Lesson.objects.all()
        if course_id:
            qs = qs.filter(course_id=course_id)

        if user.is_superuser:
            return qs

        # Students: can only see lessons for courses they are enrolled in
        if user.is_student and hasattr(user, 'student_profile'):
            student = user.student_profile
            return qs.filter(course__students=student)

        # Tutors: can see lessons for courses they teach
        if user.is_tutor and hasattr(user, 'tutor_profile'):
            tutor = user.tutor_profile
            return qs.filter(course__tutor=tutor)

        return Lesson.objects.none()

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        user = self.request.user
        if not user.is_tutor or course.tutor.user != user:
            raise permissions.exceptions.PermissionDenied("You are not the tutor of this course.")
        serializer.save()

    def perform_update(self, serializer):
        lesson = self.get_object()
        user = self.request.user
        # Check original course ownership
        if not user.is_tutor or lesson.course.tutor.user != user:
            raise permissions.exceptions.PermissionDenied("You are not the tutor of this course.")
        # Check target course ownership (if changing course)
        target_course = serializer.validated_data.get('course')
        if target_course and target_course.tutor.user != user:
            raise permissions.exceptions.PermissionDenied("You do not own the target course.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not user.is_tutor or instance.course.tutor.user != user:
            raise permissions.exceptions.PermissionDenied("You are not the tutor of this course.")
        instance.delete()
