from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.auth import get_user_model, authenticate
from django.dispatch import receiver
from rest_framework import status
from rest_framework.viewsets import ViewSet, ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django_rest_passwordreset.signals import reset_password_token_created, post_password_reset  # type: ignore
from knox.models import AuthToken  # type: ignore
from datetime import datetime
import os
User = get_user_model()

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


# def send_email(subject, template, user, btnLink=""):
#     context = {
#         'name': user.email,
#         'email': user.email,
#         'year': datetime.now().year,
#         'button_link': btnLink,
#         'link_to_[APP_NAME]': os.getenv('FRONTEND_DOMAIN'),
#         'admin_email': os.getenv('EMAIL_HOST'),
#     }
#     html_content = render_to_string(template, context)
#     plain_message = strip_tags(html_content)
#     message = EmailMultiAlternatives(
#         subject=subject,
#         body=plain_message,
#         from_email=None,
#         to=[user.email],
#     )
#     message.attach_alternative(html_content, "text/html")
#     message.send()


# @receiver(reset_password_token_created)
# def password_reset_token_created(reset_password_token, *args, **kwargs):
#     token_url = f'{os.getenv("FRONTEND_DOMAIN")}reset-password/{reset_password_token.key}'
#     send_email("Forgot your Password? - [APP_NAME]",
#                'email/forgot_password.html', reset_password_token.user, token_url)


# @receiver(post_password_reset)
# def password_reset(sender, **kwargs):
#     send_email("Password Changed Successfully - [APP_NAME]",
#                # A DO LATER HERE
#                'email/password_changed.html', kwargs['user'], 'DO LATER')

# Create your views here.
class LoginViewSet(ViewSet):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token = AuthToken.objects.create(user)[1]
            return Response({
                'user': UserSerializer(user).data, 
                'token': token
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class RegisterViewSet(ViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors, status=400)


class UsersViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # For testing purposes, change that in production [DO LATER]

    @action(detail=False, methods=['get', 'patch', 'put'])
    def current(self, request):
        if request.method in ['PATCH', 'PUT']:
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer = UserSerializer(request.user)
        return Response(serializer.data)