from django.contrib.auth import get_user_model
User= get_user_model()

class Auth:
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            if email:
                email = email.lower()
            user = User.objects.get(email=email)
            if user.check_password(password):
                return user
        except (ValueError, User.DoesNotExist):
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None