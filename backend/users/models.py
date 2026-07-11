import datetime
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from phonenumber_field.modelfields import PhoneNumberField
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from core.moodle_api import create_moodle_user, enrol_user_in_course
# from .storage import OverwriteStorage, File_Rename

# Create your models here.


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email was not provided!')

        email = email.lower()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    phone_number = PhoneNumberField(region='EG', db_index=True)

    moodle_user_id = models.IntegerField(null=True, blank=True)

    is_tutor = models.BooleanField(default=False)
    is_student = models.BooleanField(default=False)
    # profile_picture = models.ImageField(blank=True, null=True)
    # nationality = models.ForeignKey(
    #     'shows.Country', on_delete=models.CASCADE, blank=True, null=True)

    is_active = models.BooleanField(default=False)

    # Specify the required fields for user creation
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone_number']
    objects = CustomUserManager()

    def __str__(self):
        name = f'{self.first_name} {self.last_name}'.strip()
        return name if name else self.email


class TutorProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, primary_key=True, related_name='tutor_profile')

    about = models.TextField(blank=True)
    experience = models.TextField(blank=True)
    teaching_since = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1950),
            MaxValueValidator(datetime.date.today().year),
        ],
        help_text='Use a valid year (e.g., 2005)'
    )

    def __str__(self):
        name = f'{self.user.first_name} {self.user.last_name}'.strip()
        return name if name else self.user.email

class StudentProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, primary_key=True, related_name='student_profile')

    reached = models.JSONField(default=dict, blank=True)

    # University fields live here (can be null if is a school student)
    is_university_student = models.BooleanField(default=False)
    uni_id = models.PositiveIntegerField(
        validators=[MinValueValidator(100000), MaxValueValidator(999999)],
        blank=True, null=True
    )

    def __str__(self):
        name = f'{self.user.first_name} {self.user.last_name}'.strip()
        return name if name else self.user.email

@receiver(post_save, sender=CustomUser)
def save_or_create_user_profile(sender, instance, created, **kwargs):
    if created:
        # Create user in Moodle
        moodle_id = create_moodle_user(instance)
        if moodle_id:
            instance.moodle_user_id = moodle_id
            instance.save(update_fields=['moodle_user_id'])

    if instance.is_tutor:
        TutorProfile.objects.get_or_create(
            user=instance, 
            defaults={'teaching_since': datetime.date.today().year}
        )
    elif instance.is_student:
        StudentProfile.objects.get_or_create(
            user=instance, 
            defaults={'reached': {}}
        )

@receiver(m2m_changed, sender='courses.Course_students')
def sync_enrollment_to_moodle(sender, instance, action, pk_set, **kwargs):
    """
    When a student is added to a Course in Django, enrol them in Moodle.
    """
    if action == "post_add":
        from courses.models import Course
        if isinstance(instance, Course) and instance.moodle_course_id:
            for student_id in pk_set:
                try:
                    student_profile = StudentProfile.objects.get(pk=student_id)
                    user = student_profile.user
                    if user.moodle_user_id:
                        enrol_user_in_course(user.moodle_user_id, instance.moodle_course_id)
                except StudentProfile.DoesNotExist:
                    continue