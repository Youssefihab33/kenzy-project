from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course
from core.moodle_api import get_course_contents, get_moodle_login_url

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing courses and fetching their content from Moodle.
    """
    queryset = Course.objects.all()
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
