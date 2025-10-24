# Authentication Integration Guide

This guide explains how to integrate the authentication system with your existing MCP Maps 3D application.

## Quick Integration (5 Steps)

### Step 1: Setup Supabase (2 minutes)

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Project Settings** → **API**
4. Copy your:
   - **Project URL**
   - **anon public key**

### Step 2: Configure Environment Variables

Create `frontend/.env.local`:

```bash
cd frontend
cp ../.env.example .env.local
```

Edit `.env.local` and add:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3: Choose Your Integration Method

You have two options:

#### Option A: Quick Test (Recommended for Testing)

Replace your `frontend/src/index.tsx` with the auth-enabled version:

```bash
cd frontend/src
# Backup your current index.tsx
cp index.tsx index.tsx.backup

# Use the authenticated version
cp index-with-auth.tsx index.tsx
```

#### Option B: Manual Integration (Recommended for Production)

See the detailed instructions below.

### Step 4: Update Your HTML Template

Edit `frontend/index.html` and make sure Tailwind CSS is included:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MCP Maps 3D</title>

    <!-- Add Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

### Step 5: Test It!

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) - you should see the login page!

## How It Works

### Logout Flow

The logout button in your sidebar now:

1. Calls `_handleLogout()` in `map_app.ts`
2. Which calls the global `handleLogout()` function
3. Which calls `signOut()` from the auth context
4. Which signs the user out and shows the login page

### Authentication Flow

```
User visits app
    ↓
AuthProvider checks session
    ↓
Session exists? ────→ No ────→ Show SignIn/SignUp
    ↓                             ↓
   Yes                       User logs in
    ↓                             ↓
Show MapApp ←──────────────────────┘
    ↓
User clicks logout button
    ↓
Sign out & return to login
```

## Manual Integration Details

If you want to manually integrate instead of using `index-with-auth.tsx`:

### 1. Update index.tsx

Add these imports at the top:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthWrapper } from './components/auth';
import './components/auth/auth.css';
```

### 2. Create Auth Wrapper Component

Add this component to wrap your MapApp:

```tsx
function AuthenticatedMapApp() {
  const { user, signOut } = useAuth();

  React.useEffect(() => {
    if (!user) return;

    // Add logout handler
    (window as any).handleLogout = async () => {
      await signOut();
    };

    // Your existing map app initialization code here
    const rootElement = document.querySelector('#map-app-container')! as HTMLElement;
    const mapApp = new MapApp();
    rootElement.innerHTML = '';
    rootElement.appendChild(mapApp);

    // ... rest of your initialization code ...

  }, [user, signOut]);

  if (!user) {
    return null;
  }

  return <div id="map-app-container" style={{ width: '100%', height: '100vh' }} />;
}
```

### 3. Update Your App Component

Replace your main app initialization:

```tsx
function App() {
  return (
    <AuthProvider>
      <AuthWrapper defaultView="signin" />
      <AuthenticatedMapApp />
    </AuthProvider>
  );
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
});
```

## Customization

### Change Login Page Colors

Edit `frontend/src/components/auth/SignIn.tsx` and `SignUp.tsx`:

```tsx
// Find all instances of:
className="bg-emerald-600"
className="text-emerald-600"

// Replace with your brand color:
className="bg-blue-600"
className="text-blue-600"
```

### Add User Info to Header

You can access user info anywhere with:

```tsx
import { useAuth } from './contexts/AuthContext';

function YourComponent() {
  const { user } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.email}!</p>
      <p>Name: {user?.user_metadata?.full_name}</p>
    </div>
  );
}
```

### Customize Login Page Text

Edit the `HeroSection` components in `SignIn.tsx` and `SignUp.tsx`:

```tsx
<HeroSection
  title="Your Custom Title"
  description="Your custom description"
  icon={<YourIcon />}
/>
```

## Troubleshooting

### "User is not defined"

Make sure you wrapped your component in `<AuthProvider>`.

### Logout button doesn't work

1. Check browser console for errors
2. Verify `_handleLogout` is defined in `map_app.ts`
3. Check that `handleLogout` is set in the window object

### Login page not showing

1. Verify Supabase credentials in `.env.local`
2. Check that variables start with `VITE_`
3. Restart dev server after adding env variables

### Styles not loading

1. Make sure Tailwind CSS is included in `index.html`
2. Import `./components/auth/auth.css` in your index file
3. Clear browser cache

## Testing Authentication

### Test Sign Up

1. Click "Sign up" on the login page
2. Enter email and password
3. Check your email for verification link
4. Click verification link
5. You should be logged in!

### Test Logout

1. Click the logout button in the sidebar (bottom right)
2. You should return to the login page
3. Your session is cleared

### Test Google OAuth

1. Enable Google provider in Supabase Dashboard
2. Configure OAuth credentials
3. Click "Continue with Google"
4. Authorize with your Google account

## Production Checklist

Before deploying:

- [ ] Use different Supabase projects for dev/staging/prod
- [ ] Configure custom SMTP for emails
- [ ] Set up proper OAuth redirect URLs
- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Test password reset flow
- [ ] Test email verification flow
- [ ] Add error monitoring
- [ ] Review and customize email templates

## Additional Resources

- [Complete Setup Guide](docs/AUTH_SETUP_GUIDE.md)
- [Quick Start](frontend/QUICKSTART_AUTH.md)
- [Component API](frontend/src/components/auth/README.md)
- [Supabase Docs](https://supabase.com/docs/guides/auth)

## Need Help?

1. Check the browser console for errors
2. Review Supabase logs in your dashboard
3. See the troubleshooting sections in the full guides
4. Check that all dependencies are installed

---

**You're all set!** The logout button now routes users back to the auth page when clicked. 🎉
