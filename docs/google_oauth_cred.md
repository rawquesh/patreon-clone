# Google OAuth Credentials Guide

I have investigated the usage of Google credentials in your backend:

1. They are defined in the `app-backend/.env` file.
2. They are used in the backend for Google Single Sign-On (SSO) at `app-backend/src/auth/strategies/auth.google.ts`.
3. The server uses the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to authenticate with Google's OAuth2 service. 
4. **Crucial Detail:** The backend expects the Google OAuth callback URL to be configured as: `YOUR_BACKEND_URL/auth/google/callback`.

To make the "Sign in with Google" functionality work, you need to generate these credentials from the Google Cloud Console. Here is a step-by-step guide.

## 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown near the top-left (next to the Google Cloud logo) and select **New Project**.
3. Enter a Project Name (e.g., "Patreon Clone") and click **Create**.
4. Once created, make sure the project is selected from the top dropdown.

## 2. Configure the OAuth Consent Screen
Before creating credentials, Google requires you to set up the consent screen (the screen users see when they click "Sign in with Google").

1. In the left-hand navigation menu, go to **APIs & Services > OAuth consent screen**.
2. Choose **External** (unless you are restricting usage to internal Google Workspace users) and click **Create**.
3. Fill out the required information:
   - **App name**: The name users will see.
   - **User support email**: Your email.
   - **Developer contact information**: Your email.
4. Click **Save and Continue**.
5. On the **Scopes** page, you don't need to add anything special because your backend already requests `email` and `profile` automatically. Click **Save and Continue**.
6. On the **Test users** page, click **Add Users** and add your own Google email address while the app is in testing mode. Click **Save and Continue**.

## 3. Create OAuth Credentials
Now you will generate the actual Client ID and Client Secret.

1. In the left-hand navigation menu, go to **APIs & Services > Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3. For **Application type**, select **Web application**.
4. Give it a name (e.g., "Backend Server").
5. Under **Authorized JavaScript origins**, click **+ ADD URI**. 
   - Add your frontend URL (e.g., `http://localhost:3000` or your production frontend URL).
6. Under **Authorized redirect URIs**, click **+ ADD URI**.
   - This is the most critical part. Your backend code explicitly expects the callback to be:
   - For Local Development: `http://localhost:8080/auth/google/callback` (or whichever port you use locally).
   - For Production: `https://your-production-backend.com/auth/google/callback`.
7. Click **Create**.

## 4. Copy the Credentials to `.env`
A modal will appear displaying your **Client ID** and **Client Secret**.

Update your `app-backend/.env` file to look like this:

```env
GOOGLE_CLIENT_ID="your_copied_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_copied_client_secret"
```

Restart your backend server to load the new variables, and Google authentication will be fully operational for your app!
