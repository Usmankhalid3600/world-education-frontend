# Google OAuth Setup Guide

## Prerequisites
You need a Google Cloud Platform project with OAuth 2.0 credentials configured.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "World Education"
4. Click "Create"

## Step 2: Enable Google Sign-In API

1. In the Google Cloud Console, select your project
2. Go to "APIs & Services" → "Library"
3. Search for "Google Sign-In API" or "Google Identity"
4. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - User Type: External
   - App name: World Education
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: email, profile, openid
   - Test users: Add your email for testing
   - Click "Save and Continue"

4. After consent screen is configured, create OAuth client ID:
   - Application type: **Web application**
   - Name: World Education Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:8080`
   - Authorized redirect URIs:
     - `http://localhost:3000`
     - `http://localhost:8080/api/auth/google`
   - Click "Create"

5. **Copy the Client ID** - You'll need this!

## Step 4: Configure Frontend

1. Create a `.env` file in the project root (if not exists):
   ```bash
   cd world-education-frontend
   cp .env.example .env
   ```

2. Add your Google Client ID to `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:8080
   REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
   ```

3. Replace `YOUR_CLIENT_ID_HERE` with the actual Client ID from Google Cloud Console

## Step 5: Configure Backend

Your backend already has the Google OAuth endpoint: `POST /api/auth/google`

Make sure the backend:
1. Accepts the Google token in the request body: `{ "token": "..." }`
2. Verifies the token with Google's API
3. Extracts user info (email, name, etc.)
4. Creates or retrieves the user with `signupMethod = "GOOGLE"`
5. Returns JWT token and user data

Example backend verification (in your `AuthController`):
```java
@PostMapping("/google")
public ResponseEntity<?> googleAuth(@RequestBody Map<String, String> request) {
    try {
        String token = request.get("token");
        
        // Verify token with Google
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
            .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
            .build();
            
        GoogleIdToken idToken = verifier.verify(token);
        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.get("family_name");
            
            // Create or get user with GOOGLE signup method
            User user = userService.createOrGetGoogleUser(email, firstName, lastName);
            
            // Generate JWT
            String jwtToken = jwtUtil.generateToken(user.getUserId());
            
            return ResponseEntity.ok(new AuthResponse(user, jwtToken));
        }
    } catch (Exception e) {
        return ResponseEntity.status(401).body("Invalid Google token");
    }
}
```

## Step 6: Test Google Sign-In

1. **Restart the frontend** (required for .env changes):
   ```bash
   npm start
   ```

2. Navigate to Login or SignUp page

3. You should see "Continue with Google" button below the form

4. Click the button:
   - Google Sign-In popup appears
   - Select your Google account
   - Grant permissions
   - Backend receives token and creates/logs in user
   - Redirect to Dashboard

## Troubleshooting

### Error: "Invalid Client ID"
- Check that `REACT_APP_GOOGLE_CLIENT_ID` in `.env` matches the Client ID from Google Cloud Console
- Restart the dev server after changing `.env`

### Error: "Unauthorized JavaScript origin"
- In Google Cloud Console, add `http://localhost:3000` to Authorized JavaScript origins
- Wait a few minutes for changes to propagate

### Google button doesn't appear
- Check browser console for errors
- Verify Google script is loaded: `window.google` should be defined
- Check if `REACT_APP_GOOGLE_CLIENT_ID` is set

### Error: "Access blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration
- Add your email as a test user
- Make sure app is in "Testing" mode

### Backend returns "Invalid token"
- Ensure backend has Google OAuth verification library
- Client ID on backend must match frontend
- Token verification might be failing

## Production Deployment

When deploying to production:

1. **Add production domain to Google Cloud Console:**
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com`, `https://api.yourdomain.com/api/auth/google`

2. **Update .env for production:**
   ```env
   REACT_APP_API_URL=https://api.yourdomain.com
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```

3. **OAuth Consent Screen:**
   - Change from "Testing" to "In Production"
   - Complete verification process if required by Google

## Security Notes

1. **Never commit `.env` file to Git** - It's already in `.gitignore`
2. **Client ID is public** - It's safe to expose in frontend code
3. **Client Secret** - NEVER use in frontend, only on backend
4. **Token verification** - Always verify Google tokens on backend
5. **HTTPS in production** - Required for OAuth to work properly

## Backend Dependencies

Make sure your Spring Boot backend has these dependencies:

```xml
<!-- Google OAuth -->
<dependency>
    <groupId>com.google.api-client</groupId>
    <artifactId>google-api-client</artifactId>
    <version>2.0.0</version>
</dependency>
<dependency>
    <groupId>com.google.auth</groupId>
    <artifactId>google-auth-library-oauth2-http</artifactId>
    <version>1.19.0</version>
</dependency>
```

## Support

- [Google Identity Documentation](https://developers.google.com/identity/gsi/web)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
