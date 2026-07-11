import requests
import secrets
import string
from django.conf import settings

def call_moodle_api(function, params=None):
    """
    Generic function to call Moodle Web Services API.
    """
    if params is None:
        params = {}
    
    url = f"{settings.MOODLE_URL}{settings.MOODLE_WEBSERVICE_REST_PATH}"
    
    payload = {
        'wstoken': settings.MOODLE_TOKEN,
        'wsfunction': function,
        'moodlewsrestformat': 'json',
        **params
    }
    
    try:
        response = requests.post(url, data=payload)
        response.raise_for_status()
        result = response.json()
        
        if isinstance(result, dict) and result.get('exception'):
            print(f"Moodle API Error: {result.get('message')}")
            return None
            
        return result
    except Exception as e:
        print(f"Connection Error: {str(e)}")
        return None

def create_moodle_user(user):
    """
    Creates a user in Moodle with a secure random password.
    """
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    secure_password = ''.join(secrets.choice(alphabet) for i in range(16))
    
    params = {
        'users[0][username]': user.email.lower(),
        'users[0][email]': user.email.lower(),
        'users[0][firstname]': user.first_name or 'User',
        'users[0][lastname]': user.last_name or 'Name',
        'users[0][password]': secure_password,
    }
    
    result = call_moodle_api('core_user_create_users', params)
    if result and len(result) > 0:
        return result[0]['id']
    return None

def enrol_user_in_course(moodle_user_id, moodle_course_id, role_id=5):
    """
    Enrols a user in a Moodle course. Role 5 is 'student'.
    """
    params = {
        'enrolments[0][roleid]': role_id,
        'enrolments[0][userid]': moodle_user_id,
        'enrolments[0][courseid]': moodle_course_id,
    }
    
    return call_moodle_api('enrol_manual_enrol_users', params)

def get_course_contents(moodle_course_id):
    """
    Fetches course contents (sections and modules).
    """
    params = {
        'courseid': moodle_course_id
    }
    return call_moodle_api('core_course_get_contents', params)

def get_moodle_login_url(user, course_id=None):
    """
    Generates a login URL for Moodle using userkey (SSO).
    Requires 'auth_userkey' plugin enabled in Moodle.
    """
    params = {
        'user[username]': user.email.lower()
    }
    result = call_moodle_api('auth_userkey_request_login_url', params)
    
    if result and result.get('loginurl'):
        url = result['loginurl']
        if course_id:
             url += f"&wantsurl={settings.MOODLE_URL}/course/view.php?id={course_id}"
        return url
    return None
