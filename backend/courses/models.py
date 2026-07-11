import datetime
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

# Create your models here.
class Course(models.Model):
    moodle_course_id = models.IntegerField(null=True, blank=True, unique=True)
    name = models.CharField(max_length=250)
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