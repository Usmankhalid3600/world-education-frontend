# World Education Frontend

React application for World Education platform with authentication (Email Verification & Google OAuth).

## Features

- **SignUp with Email Verification**: Two-step registration process
  1. User fills form and submits
  2. 6-digit verification code sent to email
  3. User verifies code to complete registration
  
- **Google Sign-In**: One-click authentication with Google OAuth

- **Login**: Standard email/password authentication

- **Protected Routes**: Dashboard only accessible after login

- **Responsive Design**: Mobile-friendly UI

## Tech Stack

- React 19.2.4
- React Router DOM 6.22.0
- Axios 1.6.7
- CSS3 (no external UI libraries)

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   │   ├── Input/        # Input field with validation
│   │   ├── Button/       # Button with loading state
│   │   └── Alert/        # Alert notifications
│   └── auth/             # Authentication pages
│       ├── Login/        # Login page
│       ├── SignUp/       # SignUp with verification
│       └── Dashboard/    # Success page after login
├── config/
│   └── api.js           # API endpoints configuration
├── services/
│   └── authService.js   # Authentication API calls
├── utils/
│   ├── apiClient.js     # Axios instance with interceptors
│   └── auth.js          # Auth utilities (token, user management)
├── App.js               # Main app with routing
└── index.js             # Entry point
```

## Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   REACT_APP_API_URL=http://localhost:8080
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   ```
   
   **Note:** See [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for detailed Google OAuth configuration.

3. **Start Development Server**
   ```bash
   npm start
   ```
   
   App runs on: http://localhost:3000

## Backend Requirements

The backend must be running with these endpoints:

- `POST /api/auth/signup` - Send verification code
- `POST /api/auth/verify` - Verify code & create user
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth

## Usage Flow

### SignUp
1. Navigate to `/signup`
2. Fill all required fields (User ID, Password, Email, etc.)
3. Click "Create Account"
4. Check email for 6-digit verification code
5. Enter code and click "Verify & Complete Signup"
6. Automatically logged in and redirected to Dashboard

### Login
1. Navigate to `/login` or click "Sign In" from SignUp
2. Enter User ID and Password
3. Click "Sign In"
4. Redirected to Dashboard on success

### Dashboard
- Displays "Login Successful!" message
- Shows user information
- Logout button to return to login

## Available Scripts

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm build`

Builds the app for production to the `build` folder.

### `npm test`

Launches the test runner in interactive watch mode.

## Key Features

### Authentication Flow
- JWT token stored in localStorage
- Automatic token injection in API requests via Axios interceptors
- Auto-logout on 401 Unauthorized
- Protected routes redirect to login if not authenticated

### Form Validation
- Client-side validation before API calls
- Real-time error display
- Password confirmation matching
- Email format validation

### UX Enhancements
- Loading states during API calls
- Success/Error alerts with auto-dismiss
- Responsive design for all screen sizes
- Smooth animations and transitions

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:8080` | Backend API base URL |

## Troubleshooting

**Cannot connect to backend:**
- Ensure backend is running on port 8080
- Check CORS settings on backend
- Verify `REACT_APP_API_URL` in `.env`

**Verification code not received:**
- Check spam/junk folder
- Verify email service is configured on backend
- Code expires in 15 minutes, request new code

**401 Unauthorized errors:**
- Token might be expired
- Logout and login again
- Clear localStorage and try again
