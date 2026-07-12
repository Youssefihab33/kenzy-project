from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from courses.models import Course, EnrollmentRequest, Lesson
from users.models import StudentProfile, TutorProfile

User = get_user_model()

class LessonViewSetTest(TestCase):
    @patch('core.moodle_api.call_moodle_api')
    def setUp(self, mock_call):
        mock_call.return_value = [{'id': 1}]

        # Create tutor 1
        self.tutor_user_1 = User.objects.create_user(
            email='tutor1@example.com',
            password='password123',
            first_name='Tutor',
            last_name='One',
            is_tutor=True
        )
        self.tutor_profile_1 = TutorProfile.objects.get(user=self.tutor_user_1)

        # Create tutor 2
        self.tutor_user_2 = User.objects.create_user(
            email='tutor2@example.com',
            password='password123',
            first_name='Tutor',
            last_name='Two',
            is_tutor=True
        )
        self.tutor_profile_2 = TutorProfile.objects.get(user=self.tutor_user_2)

        # Create student (enrolled)
        self.student_user_enrolled = User.objects.create_user(
            email='student_enrolled@example.com',
            password='password123',
            first_name='Student',
            last_name='Enrolled',
            is_student=True
        )
        self.student_profile_enrolled = StudentProfile.objects.get(user=self.student_user_enrolled)

        # Create student (not enrolled)
        self.student_user_other = User.objects.create_user(
            email='student_other@example.com',
            password='password123',
            first_name='Student',
            last_name='Other',
            is_student=True
        )
        self.student_profile_other = StudentProfile.objects.get(user=self.student_user_other)

        # Create course
        self.course = Course.objects.create(
            name='Test Course',
            year=2024,
            price=100,
            tutor=self.tutor_profile_1,
            moodle_course_id=789
        )
        # Enroll the first student
        self.course.students.add(self.student_profile_enrolled)

        self.client = APIClient()

    def test_lesson_creation_and_file_upload(self):
        # Authenticate as Tutor of the course
        self.client.force_authenticate(user=self.tutor_user_1)

        # Create simple mock video file
        video_content = b"fake MP4 video bytes"
        mock_video = SimpleUploadedFile("lesson1.mp4", video_content, content_type="video/mp4")

        data = {
            'course': self.course.id,
            'title': 'Introduction',
            'description': 'Welcome to the course!',
            'video': mock_video,
            'order': 1
        }

        response = self.client.post('/lessons/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Introduction')
        self.assertIsNotNone(response.data['video_url'])

        # Verify lesson in database
        lesson = Lesson.objects.get(id=response.data['id'])
        self.assertEqual(lesson.title, 'Introduction')
        self.assertTrue(lesson.video.name.endswith('.mp4'))

    def test_lesson_permissions(self):
        # Create a lesson first
        lesson = Lesson.objects.create(
            course=self.course,
            title='Intro Lesson',
            description='Test Desc',
            order=0
        )

        # 1. Enrolled student can view / list lessons
        self.client.force_authenticate(user=self.student_user_enrolled)
        response = self.client.get(f'/lessons/?course={self.course.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Intro Lesson')

        # 2. Non-enrolled student cannot list / view lessons
        self.client.force_authenticate(user=self.student_user_other)
        response = self.client.get(f'/lessons/?course={self.course.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0) # returns empty list for security

        # Student tries to retrieve the lesson directly
        response = self.client.get(f'/lessons/{lesson.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) # standard DRF behavior for out of queryset

        # 3. Student tries to create lesson - forbidden
        self.client.force_authenticate(user=self.student_user_enrolled)
        data = {'course': self.course.id, 'title': 'Hacked Lesson'}
        response = self.client.post('/lessons/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # 4. Another tutor tries to create lesson - forbidden
        self.client.force_authenticate(user=self.tutor_user_2)
        response = self.client.post('/lessons/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # 5. Correct tutor can update lesson
        self.client.force_authenticate(user=self.tutor_user_1)
        update_data = {'title': 'Updated Title', 'course': self.course.id}
        response = self.client.patch(f'/lessons/{lesson.id}/', update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lesson.refresh_from_db()
        self.assertEqual(lesson.title, 'Updated Title')
