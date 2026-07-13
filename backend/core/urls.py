"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app import views as other_views
    2. Add a URL to urlpatterns:  path('', other_views.Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from users.views import LoginViewSet, RegisterViewSet, UsersViewSet
from courses.views import EnrollmentRequestViewSet, LessonViewSet
from rest_framework.routers import DefaultRouter
from knox import views as knox_views

router = DefaultRouter()
router.register('login', LoginViewSet, basename='login')
router.register('register', RegisterViewSet, basename='register')
router.register('users', UsersViewSet, basename='users')
router.register('enrollments', EnrollmentRequestViewSet, basename='enrollments')
router.register('lessons', LessonViewSet, basename='lessons')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('courses/', include('courses.urls')),
    # Knox auth endpoints
    path('auth/logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path('auth/logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
]

from django.conf import settings
from django.conf.urls.static import static

# Router URLs registered at root: /login/, /register/, /users/, /users/current/, /enrollments/
urlpatterns += router.urls

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
