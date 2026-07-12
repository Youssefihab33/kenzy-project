from rest_framework import serializers
from .models import Course, EnrollmentRequest, Lesson
from users.models import StudentProfile

class CourseSerializer(serializers.ModelSerializer):
    tutor_name = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    enrollment_status = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'moodle_course_id', 'name', 'description', 'year',
            'price', 'contents', 'tutor', 'tutor_name', 'is_enrolled', 'enrollment_status'
        ]

    def get_tutor_name(self, obj):
        return f"Dr. {obj.tutor}"

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if not request or not request.user or request.user.is_anonymous:
            return False
        if not hasattr(request.user, 'student_profile'):
            return False
        return obj.students.filter(pk=request.user.student_profile.pk).exists()

    def get_enrollment_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user or request.user.is_anonymous:
            return None
        if not hasattr(request.user, 'student_profile'):
            return None
        try:
            enrollment_req = EnrollmentRequest.objects.get(
                student=request.user.student_profile,
                course=obj
            )
            return enrollment_req.status
        except EnrollmentRequest.DoesNotExist:
            return None


class EnrollmentRequestSerializer(serializers.ModelSerializer):
    course_name = serializers.SerializerMethodField()
    student_details = serializers.SerializerMethodField()

    class Meta:
        model = EnrollmentRequest
        fields = ['id', 'student', 'course', 'status', 'course_name', 'student_details', 'created_at', 'updated_at']
        read_only_fields = ['status', 'student']

    def get_course_name(self, obj):
        return obj.course.name

    def get_student_details(self, obj):
        return {
            "user": {
                "first_name": obj.student.user.first_name,
                "last_name": obj.student.user.last_name,
            }
        }


class LessonSerializer(serializers.ModelSerializer):
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'course', 'title', 'description', 'video', 'video_url', 'order', 'created_at', 'updated_at']
        read_only_fields = ['video_url', 'created_at', 'updated_at']

    def get_video_url(self, obj):
        if obj.video:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.video.url)
            return obj.video.url
        return None
