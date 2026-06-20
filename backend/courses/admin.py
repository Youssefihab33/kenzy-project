from django.contrib import admin
from .models import Course, Chapter, Session

# Register your models here.
admin.site.register(Course)
admin.site.register(Chapter)
admin.site.register(Session)