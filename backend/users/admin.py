from django.contrib import admin
from .models import CustomUser, TutorProfile, StudentProfile

# Register your models here.
admin.site.register(CustomUser)
admin.site.register(TutorProfile)
admin.site.register(StudentProfile)