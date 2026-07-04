# Moodle Setup Instructions

To integrate this project with Moodle, follow these steps to configure your Moodle instance.

## 1. Start Moodle
Navigate to the `moodle_setup` directory and run:
```bash
docker compose up -d
```
Moodle will be available at `http://localhost:8080`. The default credentials for Bitnami Moodle are usually:
- **User:** `user`
- **Password:** `bitnami` (or check logs with `docker compose logs moodle`)

## 2. Enable Web Services
1. Go to **Site administration** > **General** > **Advanced features**.
2. Check **Enable web services** and click **Save changes**.

## 3. Enable REST Protocol
1. Go to **Site administration** > **Server** > **Web services** > **Manage protocols**.
2. Enable the **REST protocol** (click the eye icon).

## 4. Create a Web Service User
1. Go to **Site administration** > **Users** > **Accounts** > **Add a new user**.
2. Create a user (e.g., `api_user`). Give them a strong password.

## 5. Define a Service and Add Functions
1. Go to **Site administration** > **Server** > **Web services** > **External services**.
2. Click **Add**. Name it "Django Integration", check **Enabled** and **Authorized users only**.
3. Once added, click **Functions** next to your new service.
4. Add the following functions:
   - `core_user_create_users`
   - `enrol_manual_enrol_users`
   - `core_course_get_contents`
   - `auth_userkey_request_login_url`

## 6. Authorize the User
1. Go to **Site administration** > **Server** > **Web services** > **External services**.
2. Click **Authorised users** next to your service.
3. Add your `api_user` to the authorized list.

## 7. Generate a Token
1. Go to **Site administration** > **Server** > **Web services** > **Manage tokens**.
2. Click **Add**. Select your `api_user` and the "Django Integration" service.
3. Copy the generated token.

## 8. Configure Django
Update your `.env` file or `backend/core/settings.py` with:
```python
MOODLE_URL = 'http://localhost:8080'
MOODLE_TOKEN = 'YOUR_COPIED_TOKEN'
```

## 9. Enable auth_userkey (for SSO)
1. Go to **Site administration** > **Plugins** > **Authentication** > **Manage authentication**.
2. Enable **LTI** or ensure a plugin like **User key** is enabled if you are using a custom one.
   *(Note: For the `auth_userkey_request_login_url` function to work, you may need to install/enable the "User Key Authentication" plugin in Moodle).*
