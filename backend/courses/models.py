import datetime
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

# Create your models here.
class Course(models.Model):
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
    
class Chapter(models.Model):
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE)
    number = models.FloatField()
    name = models.CharField(max_length=250)

    class Meta:
        ordering = ['course', 'number']

    def __str__(self):
        return f'{self.course} - {self.number}.{self.name}'

class Session(models.Model):
    chapter = models.ForeignKey('courses.Chapter', on_delete=models.CASCADE)
    number = models.FloatField()
    name = models.CharField(max_length=250)

    class Meta:
        ordering = ['chapter', 'number']

    def __str__(self):
        return f'{self.chapter} - {self.number}.{self.name}'