import datetime
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from phonenumber_field.modelfields import PhoneNumberField
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
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
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    phone_number = PhoneNumberField(region="EG", db_index=True)

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
        help_text="Use a valid year (e.g., 2005)"
    )
    # courses = models.ForeignKey()


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


@receiver(post_save, sender=CustomUser)
def save_or_create_user_profile(sender, instance, created, **kwargs):
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