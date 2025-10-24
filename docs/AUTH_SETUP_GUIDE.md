# Authentication Setup Guide

This guide will walk you through setting up Supabase authentication for your MCP Maps 3D application.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Supabase Setup](#supabase-setup)
- [Environment Configuration](#environment-configuration)
- [Using the Auth Components](#using-the-auth-components)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, make sure you have:
- Node.js installed (v18 or higher)
- A Supabase account (free tier works great)
- Basic knowledge of React and TypeScript

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: MCP Maps 3D (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is perfect for getting started
4. Click "Create new project" and wait for setup to complete (~2 minutes)

### Step 2: Get Your API Credentials

1. Once your project is ready, go to **Project Settings** (gear icon in left sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL**: Something like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`
4. Copy these values - you'll need them next

### Step 3: Configure Authentication Providers

#### Email/Password Authentication (Default)
Email authentication is enabled by default. No additional setup needed!

#### Google OAuth (Optional)
To enable Google sign-in:

1. In your Supabase project, go to **Authentication** → **Providers**
2. Find **Google** in the list and click to expand
3. Toggle **Enable Sign in with Google** to ON
4. You'll need to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable the **Google+ API**
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add authorized redirect URIs:
     ```
     https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
     ```
   - Copy the **Client ID** and **Client Secret**
5. Paste these values back into Supabase
6. Click **Save**

## Environment Configuration

### Step 1: Create Environment File

In the `frontend` directory, create a `.env.local` file:

```bash
cd frontend
cp ../.env.example .env.local
```

### Step 2: Add Your Supabase Credentials

Edit `.env.local` and add your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**:
- Replace the values with your actual Supabase credentials
- Never commit `.env.local` to git (it's already in `.gitignore`)
- The `VITE_` prefix is required for Vite to expose these to your app

### Step 3: Restart Your Dev Server

If your dev server is running, restart it to load the new environment variables:

```bash
npm run dev
```

## Using the Auth Components

### Basic Implementation

The simplest way to add authentication:

```tsx
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AuthWrapper, ProtectedRoute } from './components/auth';
import YourMainApp from './YourMainApp';

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute
        fallback={<AuthWrapper defaultView="signin" />}
      >
        <YourMainApp />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
```

### Advanced Usage

#### Custom Sign In Page

```tsx
import { SignIn } from './components/auth';

function CustomAuthPage() {
  return (
    <SignIn onSwitchToSignUp={() => {
      // Navigate to sign up page
      window.location.href = '/signup';
    }} />
  );
}
```

#### Access User Data

```tsx
import { useAuth } from './contexts/AuthContext';

function UserProfile() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

#### Protected Routes

```tsx
import { ProtectedRoute } from './components/auth';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  return (
    <ProtectedRoute
      onUnauthenticated={() => navigate('/login')}
    >
      <YourProtectedContent />
    </ProtectedRoute>
  );
}
```

## Customization

### Color Scheme

The auth components use your company colors (`#10b981` - emerald green). To customize:

1. Open `frontend/src/components/auth/SignIn.tsx` or `SignUp.tsx`
2. Find color classes like:
   - `bg-emerald-600` → Change to your primary color
   - `text-emerald-600` → Change to match
   - `border-emerald-500` → Change to match
   - `focus:ring-emerald-500` → Change to match

Example - changing to blue:
```tsx
// Before
className="bg-emerald-600 hover:bg-emerald-700"

// After
className="bg-blue-600 hover:bg-blue-700"
```

### Branding

Update the hero section text in `SignIn.tsx`:

```tsx
<HeroSection
  title="Your Custom Title"
  description="Your custom description here"
  icon={<YourCustomIcon />}
/>
```

### Email Templates

Customize verification emails in Supabase:

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

## Troubleshooting

### "Supabase credentials are missing"

**Problem**: Console warning about missing credentials.

**Solution**:
- Check that `.env.local` exists in the `frontend` directory
- Verify the variables start with `VITE_`
- Restart your dev server after adding variables

### Google Sign-In Not Working

**Problem**: Google OAuth button doesn't work.

**Solutions**:
1. Verify Google provider is enabled in Supabase
2. Check OAuth redirect URI matches exactly
3. Make sure Google+ API is enabled in Google Cloud Console
4. Check browser console for specific error messages

### Email Verification Not Sending

**Problem**: Users don't receive verification emails.

**Solutions**:
1. Check Supabase email settings (**Authentication** → **Email Templates**)
2. For development, check the "Confirmation emails" toggle
3. Free tier has rate limits - check your Supabase dashboard
4. Check spam folder
5. For production, configure custom SMTP (**Project Settings** → **Auth**)

### "Invalid JWT" Errors

**Problem**: Authentication errors about invalid tokens.

**Solutions**:
1. Clear browser localStorage: `localStorage.clear()`
2. Check that `VITE_SUPABASE_ANON_KEY` is correct
3. Verify your Supabase project isn't paused (free tier)
4. Check Supabase project status at [status.supabase.com](https://status.supabase.com)

### Styles Not Loading

**Problem**: Auth pages look unstyled.

**Solutions**:
1. Import the auth CSS in your main file:
   ```tsx
   import './components/auth/auth.css';
   ```
2. Verify Tailwind CSS is configured correctly
3. Check that all Lucide React icons are installed

## Production Checklist

Before deploying to production:

- [ ] Configure custom SMTP for emails (Supabase → Project Settings → Auth)
- [ ] Set up proper redirect URLs for OAuth providers
- [ ] Add your production domain to Supabase authorized redirect URLs
- [ ] Enable RLS (Row Level Security) on your database tables
- [ ] Set up proper user roles and permissions
- [ ] Configure email rate limiting
- [ ] Test password reset flow
- [ ] Test email verification flow
- [ ] Set up monitoring for auth failures
- [ ] Review and customize email templates
- [ ] Enable MFA (Multi-Factor Authentication) if needed

## Security Best Practices

1. **Never commit `.env.local`** - It contains sensitive credentials
2. **Use environment-specific credentials** - Different keys for dev/staging/prod
3. **Enable Row Level Security (RLS)** in Supabase for all tables
4. **Implement rate limiting** - Protect against brute force attacks
5. **Use HTTPS** - Always in production
6. **Validate user input** - Both client and server side
7. **Rotate keys regularly** - Every 3-6 months
8. **Monitor auth logs** - Check for suspicious activity in Supabase dashboard

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Auth Best Practices](https://reactjs.org/docs/context.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

## Support

If you encounter issues:

1. Check the Supabase [Discord community](https://discord.supabase.com)
2. Review [Supabase GitHub discussions](https://github.com/supabase/supabase/discussions)
3. Check the browser console for error messages
4. Review Supabase logs in your project dashboard

---

Happy authenticating! 🎉
