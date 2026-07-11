from django.test import TestCase
from django.contrib.auth import get_user_model
from courses.models import Course
from users.models import StudentProfile, TutorProfile
from unittest.mock import patch

User = get_user_model()

class MoodleIntegrationTest(TestCase):
    @patch('core.moodle_api.call_moodle_api')
    def setUp(self, mock_call):
        mock_call.return_value = [{'id': 1}]
        self.tutor_user = User.objects.create_user(
            email='tutor@example.com',
            password='password123',
            first_name='Tutor',
            last_name='User',
            is_tutor=True
        )
        self.tutor_profile = TutorProfile.objects.get(user=self.tutor_user)
        
        self.student_user = User.objects.create_user(
            email='student@example.com',
            password='password123',
            first_name='Student',
            last_name='User',
            is_student=True
        )
        self.student_profile = StudentProfile.objects.get(user=self.student_user)

    @patch('core.moodle_api.call_moodle_api')
    def test_user_creation_calls_moodle(self, mock_call):
        mock_call.return_value = [{'id': 123}]
        
        new_user = User.objects.create_user(
            email='new@example.com',
            password='password123',
            is_student=True
        )
        
        self.assertTrue(mock_call.called)
        self.assertEqual(new_user.moodle_user_id, 123)

    @patch('core.moodle_api.call_moodle_api')
    def test_enrollment_calls_moodle(self, mock_call):
        # Setup student with moodle ID
        self.student_user.moodle_user_id = 456
        self.student_user.save()
        
        course = Course.objects.create(
            name='Test Course',
            year=2024,
            price=100,
            tutor=self.tutor_profile,
            moodle_course_id=789
        )
        
        mock_call.reset_mock()
        course.students.add(self.student_profile)
        
        # Verify enrol_manual_enrol_users was called
        calls = [call[0][0] for call in mock_call.call_args_list]
        self.assertIn('enrol_manual_enrol_users', calls)
