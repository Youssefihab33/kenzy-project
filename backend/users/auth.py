from django.contrib.auth import get_user_model
User = get_user_model()

class Auth:
    def authenticate(self, request, email=None, password=None, **kwargs):
        # 1. Fallback to 'username' if 'email' was not provided (handles Django Admin login)
        lookup_email = email or kwargs.get('username')
        
        if not lookup_email:
            return None
            
        try:
            lookup_email = lookup_email.lower()
            # 2. Look up the user by email field
            user = User.objects.get(email=lookup_email)
            
            # 3. Check their password and verify they are a staff member if using the admin backend
            if user.check_password(password):
                return user
        except (ValueError, User.DoesNotExist):
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None