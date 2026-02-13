# Quick Start Guide - World Education Frontend

## 🚀 Getting Started

### Step 1: Installation
```bash
cd world-education-frontend
npm install
```

### Step 2: Start Application
```bash
npm start
```
App will open at: **http://localhost:3000**

## 📱 User Flow

### 1️⃣ SignUp Process

**Page: http://localhost:3000/signup**

1. Fill the registration form:
   ```
   Account Information:
   - User ID (min 4 chars)
   - Password (min 8 chars)
   - Confirm Password
   
   Personal Information:
   - First Name *
   - Last Name *
   - Email * (use real email)
   - Mobile Number *
   - Country (optional)
   - State (optional)
   - City (optional)
   - Address (optional)
   ```

2. Click **"Create Account"**

3. Check your email for a 6-digit verification code

4. Enter the code in the verification screen

5. Click **"Verify & Complete Signup"**

6. ✅ Auto-login and redirect to Dashboard

### 2️⃣ Login Process

**Page: http://localhost:3000/login**

1. Enter credentials:
   ```
   - User ID
   - Password
   ```

2. Click **"Sign In"**

3. ✅ Success message and redirect to Dashboard

### 3️⃣ Dashboard

**Page: http://localhost:3000/dashboard**

- Shows "Login Successful!" message
- Displays your user information
- Click **"Logout"** to sign out

## 🔐 Protected Routes

- `/dashboard` - Requires login
- `/login` - Public (redirects to dashboard if logged in)
- `/signup` - Public (redirects to dashboard if logged in)
- `/` - Redirects to `/login`

## 🎨 Features

✅ Email verification with 6-digit code
✅ Two-step signup process
✅ Form validation
✅ Loading states
✅ Success/Error alerts
✅ Responsive design (mobile-friendly)
✅ Smooth animations
✅ Auto-logout on unauthorized access
✅ JWT token management

## 🛠️ Backend Requirements

Make sure your backend is running on **port 8080** with these endpoints:

- `POST /api/auth/signup` - Send verification code
- `POST /api/auth/verify` - Verify code & create user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth (future)

## 📝 Test Users

Create test users through the SignUp page with:
- Any unique User ID (min 4 chars)
- Strong password (min 8 chars)
- Valid email address (for verification)

## 🐛 Troubleshooting

**Port 3000 already in use:**
```bash
lsof -ti:3000 | xargs kill -9
npm start
```

**Cannot connect to backend:**
- Check if backend is running on port 8080
- Verify CORS is enabled on backend
- Check browser console for errors

**Verification code not received:**
- Check spam/junk folder
- Ensure email service is configured on backend
- Code expires in 15 minutes

**Build errors:**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📚 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Input/       # Text input with validation
│   │   ├── Button/      # Button with loading state
│   │   └── Alert/       # Success/Error messages
│   └── auth/            # Authentication pages
│       ├── Login/       # Login form
│       ├── SignUp/      # Two-step signup
│       └── Dashboard/   # Success page
├── config/              # API configuration
├── services/            # API calls
├── utils/               # Helpers (auth, axios)
└── App.js              # Main app with routing
```

## 🎯 Key Components

### Input Field
```jsx
<Input
  label="Email"
  type="email"
  name="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
  required
/>
```

### Button
```jsx
<Button 
  type="submit" 
  loading={loading}
  fullWidth
>
  Submit
</Button>
```

### Alert
```jsx
<Alert 
  type="success" 
  message="Login successful!" 
  onClose={() => setAlert(null)}
/>
```

## 📦 Dependencies

- **React** 19.2.4 - UI library
- **React Router DOM** 6.22.0 - Routing
- **Axios** 1.6.7 - HTTP client

## 🔄 Authentication Flow

```
SignUp:
User fills form → API sends code → User verifies → Auto-login → Dashboard

Login:
User enters credentials → API validates → Save token → Dashboard

Logout:
Clear localStorage → Redirect to Login
```

## 💡 Tips

- Use a real email for SignUp to receive verification code
- Code expires in 15 minutes
- Passwords must be at least 8 characters
- User IDs must be at least 4 characters
- All fields with * are required

## 🎨 Design

- Clean, modern UI
- Purple gradient backgrounds
- Card-based layouts
- Smooth animations
- Mobile-responsive
- Accessible form elements

---

**Need Help?** Check [README.md](README.md) and [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for detailed documentation.
