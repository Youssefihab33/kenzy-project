from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from courses.models import Course, EnrollmentRequest
from users.models import StudentProfile, TutorProfile

User = get_user_model()

class EnrollmentRequestTest(TestCase):
    @patch('core.moodle_api.call_moodle_api')
    def setUp(self, mock_call):
        mock_call.return_value = [{'id': 1}]

        # Create tutor
        self.tutor_user = User.objects.create_user(
            email='tutor@example.com',
            password='password123',
            first_name='Tutor',
            last_name='User',
            is_tutor=True
        )
        self.tutor_profile = TutorProfile.objects.get(user=self.tutor_user)

        # Create student
        self.student_user = User.objects.create_user(
            email='student@example.com',
            password='password123',
            first_name='Student',
            last_name='User',
            is_student=True
        )
        self.student_profile = StudentProfile.objects.get(user=self.student_user)

        # Create course
        self.course = Course.objects.create(
            name='Test Course',
            year=2024,
            price=100,
            tutor=self.tutor_profile,
            moodle_course_id=789
        )

        self.client = APIClient()

    @patch('core.moodle_api.call_moodle_api')
    def test_enrollment_workflow(self, mock_call):
        # 1. Login student and request enrollment
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(f'/courses/{self.course.id}/enroll/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify enrollment request is created and pending
        req = EnrollmentRequest.objects.get(student=self.student_profile, course=self.course)
        self.assertEqual(req.status, 'pending')

        # 2. Check student can list their requests
        response = self.client.get('/enrollments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['course_name'], self.course.name)

        # 3. Authenticate as tutor and approve
        self.client.force_authenticate(user=self.tutor_user)

        # Verify tutor can list requests
        response = self.client.get('/enrollments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # Approve the request
        mock_call.reset_mock()
        response = self.client.post(f'/enrollments/{req.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify status updated
        req.refresh_from_db()
        self.assertEqual(req.status, 'approved')

        # Verify student is added to the course
        self.assertTrue(self.course.students.filter(pk=self.student_profile.pk).exists())

    @patch('core.moodle_api.call_moodle_api')
    def test_enrollment_rejection_and_permissions(self, mock_call):
        # 1. Login student and request enrollment
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(f'/courses/{self.course.id}/enroll/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        req = EnrollmentRequest.objects.get(student=self.student_profile, course=self.course)

        # 2. Student trying to approve/reject should be forbidden (since they aren't tutor of the course)
        response = self.client.post(f'/enrollments/{req.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.post(f'/enrollments/{req.id}/reject/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Tutor rejects the request
        self.client.force_authenticate(user=self.tutor_user)
        response = self.client.post(f'/enrollments/{req.id}/reject/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify status is rejected
        req.refresh_from_db()
        self.assertEqual(req.status, 'rejected')
        self.assertFalse(self.course.students.filter(pk=self.student_profile.pk).exists())
