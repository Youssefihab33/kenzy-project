import datetime
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

# Create your models here.
class Course(models.Model):
    moodle_course_id = models.IntegerField(null=True, blank=True, unique=True)
    name = models.CharField(max_length=250)
    description = models.TextField(blank=True)
    year = models.PositiveIntegerField(
        validators=[
            MinValueValidator(2000),
            MaxValueValidator(datetime.date.today().year),
        ],
        help_text='Use a valid year (e.g., 2005)'
    )
    # image = models.ImageField()
    price = models.PositiveIntegerField()
    contents = models.JSONField(default=dict, blank=True)
    tutor = models.ForeignKey('users.TutorProfile', on_delete=models.CASCADE)
    students = models.ManyToManyField('users.StudentProfile')

    class Meta:
        ordering = ['year', 'price']

    def __str__(self):
        return f'Dr.{self.tutor} - {self.name}'


class EnrollmentRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    student = models.ForeignKey('users.StudentProfile', on_delete=models.CASCADE, related_name='enrollment_requests')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollment_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student} -> {self.course} ({self.status})"


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=250)
    description = models.TextField(blank=True)
    video = models.FileField(upload_to='lessons/videos/', null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.course.name} - {self.title}"
