# Google Sign-In Feature - Quick Reference

## What Was Added

### 1. GoogleSignIn Component
**Location:** `src/components/common/GoogleSignIn/`

**Features:**
- Loads Google Identity Services SDK automatically
- Renders official Google Sign-In button
- Handles OAuth flow and token exchange
- Integrates with backend API
- Error handling with callback

**Usage:**
```jsx
<GoogleSignIn onError={(message) => setAlert({ type: 'error', message })} />
```

### 2. Integration Points

#### Login Page
- Google Sign-In button appears below login form
- Separated by "OR" divider
- Same user flow as regular login

#### SignUp Page
- Google Sign-In button appears only on Step 1 (registration form)
- Hidden during Step 2 (verification code entry)
- Bypasses email verification when using Google

### 3. User Flow

#### Google Sign-In Flow:
```
User clicks "Continue with Google" button
        ↓
Google popup opens with account selection
        ↓
User selects Google account
        ↓
Google returns ID token (credential)
        ↓
Frontend sends token to backend: POST /api/auth/google
        ↓
Backend verifies token with Google
        ↓
Backend creates/retrieves user with signupMethod = "GOOGLE"
        ↓
Backend returns JWT token + user data
        ↓
Frontend saves token and user to localStorage
        ↓
Redirect to Dashboard
```

## Configuration Required

### Frontend (.env)
```env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### Backend
- Endpoint: `POST /api/auth/google`
- Request body: `{ "token": "google_id_token" }`
- Must verify token with Google
- Create user with `signupMethod = "GOOGLE"`
- Return JWT + user data

## Setup Steps

### Quick Setup:
1. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Get Google Client ID from [Google Cloud Console](https://console.cloud.google.com/)

3. Add Client ID to `.env`:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
   ```

4. Restart dev server:
   ```bash
   npm start
   ```

### Detailed Setup:
See [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for complete guide.

## Testing

### Without Google Client ID:
- Button will still appear
- Clicking will show error (invalid client ID)
- Need real Google credentials to test

### With Google Client ID:
1. Navigate to http://localhost:3000/login
2. Look for "Continue with Google" button
3. Click button
4. Google popup should appear
5. Select account
6. Should redirect to dashboard

## UI Details

### Button Appearance:
- Official Google branding
- "Continue with Google" text
- Google logo on left
- Full width to match form buttons
- Responsive design

### Divider:
- "OR" text centered
- Horizontal lines on both sides
- Subtle gray color
- 24px spacing above/below

### Loading State:
- Button dims (opacity: 0.6)
- Click events disabled
- Prevents multiple submissions

## Error Handling

### Frontend Errors:
- Google script load failure
- Invalid Client ID
- User cancels Google popup
- Network errors

All errors passed to `onError` callback → displayed in Alert component

### Backend Errors:
- Invalid token
- Token verification failed
- User creation failed
- Database errors

Backend error messages displayed to user via Alert

## Component Files

```
src/components/common/GoogleSignIn/
├── GoogleSignIn.js       # Main component logic
└── GoogleSignIn.css      # Styling (divider, button container)
```

### Key Code Segments:

**Loading Google SDK:**
```javascript
const script = document.createElement('script');
script.src = 'https://accounts.google.com/gsi/client';
script.async = true;
script.defer = true;
```

**Initialize Google Sign-In:**
```javascript
window.google.accounts.id.initialize({
  client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  callback: handleGoogleResponse,
});
```

**Render Button:**
```javascript
window.google.accounts.id.renderButton(
  document.getElementById('google-signin-button'),
  {
    theme: 'outline',
    size: 'large',
    width: '100%',
    text: 'continue_with',
  }
);
```

## Security Notes

1. **Client ID is public** - Safe to expose in frontend
2. **Token verification on backend** - Never trust frontend tokens
3. **User data from Google** - Extract from verified token payload
4. **HTTPS in production** - Required for OAuth
5. **CORS configuration** - Backend must allow frontend origin

## Styling

### Divider CSS:
```css
.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}
```

### Button Container:
```css
#google-signin-button {
  display: flex;
  justify-content: center;
  min-height: 44px;
}
```

## Backend Integration

### Expected Request:
```json
POST /api/auth/google
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

### Expected Response (Success):
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "email": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "userCategory": "STUDENT",
    "signupMethod": "GOOGLE",
    "token": "jwt_token_here"
  }
}
```

### Expected Response (Error):
```json
{
  "success": false,
  "message": "Invalid Google token"
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Button not appearing | Check browser console, verify script loaded |
| "Invalid Client ID" | Update REACT_APP_GOOGLE_CLIENT_ID in .env, restart server |
| "Unauthorized JavaScript origin" | Add http://localhost:3000 in Google Cloud Console |
| Backend error | Check token verification, ensure /api/auth/google endpoint exists |
| User data not saving | Verify backend creates user with GOOGLE signup method |

## Future Enhancements

- [ ] Google One Tap sign-in (automatic popup)
- [ ] Account linking (merge Google + Email accounts)
- [ ] Profile picture from Google
- [ ] Auto-fill user info from Google profile
- [ ] Remember last used Google account

## Documentation Links

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Google Sign-In Button](https://developers.google.com/identity/gsi/web/guides/display-button)
- [Token Verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)

---

**Status:** ✅ Fully implemented and integrated with Login and SignUp pages
