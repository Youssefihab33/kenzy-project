from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import CustomUser, StudentProfile, TutorProfile
User = get_user_model()

from rest_framework import serializers
from django.contrib.auth import authenticate

class LoginSerializer(serializers.Serializer):
    # Inputs
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    # Outputs
    id = serializers.IntegerField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    is_student = serializers.BooleanField(read_only=True)
    is_tutor = serializers.BooleanField(read_only=True) 
    is_active = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # If your custom authentication backend uses email as username:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            
            if not user:
                raise serializers.ValidationError("Invalid email or password.")
            
            if not user.is_active:
                raise serializers.ValidationError("This user account is disabled.")
        else:
            raise serializers.ValidationError("Both email and password are required.")

        # Save the authenticated user object into the validated data context
        attrs['user'] = user
        return attrs

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number', 'password', 'is_student', 'is_tutor']
        extra_kwargs = {
            'password': {'write_only': True}
        }
        
    def validate_email(self, value):
        normalized_email = value.lower()
        if User.objects.filter(email=normalized_email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized_email

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        exclude = ['password', 'groups', 'user_permissions']
        read_only_fields = ['__all__']