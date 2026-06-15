import datetime
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from phonenumber_field.modelfields import PhoneNumberField
from django.core.validators import MaxValueValidator, MinValueValidator
# from .storage import OverwriteStorage, File_Rename

# Helper functions
def current_year():
    return datetime.date.today().year
def max_value_current_year(value):
    return MaxValueValidator(current_year())(value)

# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Username was not provided!')

        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, password, **extra_fields)


class CustomUser(AbstractUser):
    username = models.CharField(max_length=30, unique=True)
    email = models.EmailField(unique=True)
    phone_number = PhoneNumberField(region="EG", db_index=True)
    profile_picture = models.ImageField(blank=True, null=True)
    # nationality = models.ForeignKey(
    #     'shows.Country', on_delete=models.CASCADE, blank=True, null=True)

    # Specify the required fields for user creation
    REQUIRED_FIELDS = ['email', 'phone_number']
    objects = CustomUserManager()

    def __str__(self):
        return self.username

class Tutor(CustomUser):
    about = models.TextField()
    experience = models.TextField()
    teaching_since = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1950),
            max_value_current_year
        ],
        help_text="Use a four-digit year (e.g., 2005)"
    )
    # courses = models.ForeignKey()
    def __str__(self):
        return 'Dr. ' + self.username

class Student(CustomUser):
    reached = models.JSONField()
    # payments = models.ForeignKey()
    # subscriptions = models.ForeignKey()
    def __str__(self):
        return self.username