# Authentication Quick Start

Get authentication up and running in 5 minutes!

## 1. Install Dependencies ✅

Already installed! The following packages are ready:
- `@supabase/supabase-js` - Supabase client
- `react` & `react-dom` - React framework
- `lucide-react` - Beautiful icons

## 2. Get Supabase Credentials

### Option A: Create New Supabase Project (5 minutes)

1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Fill in:
   - Name: `mcp-maps-3d`
   - Database Password: (choose a strong password)
   - Region: (closest to you)
4. Click **"Create new project"** and wait ~2 minutes
5. Once ready, go to **Settings** → **API**
6. Copy:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon public key** → This is your `VITE_SUPABASE_ANON_KEY`

### Option B: Use Existing Project

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the URL and anon key

## 3. Configure Environment

Create a `.env.local` file in the `frontend` directory:

```bash
# From the project root
cd frontend
cp ../.env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Test the Components

### Option A: Use the Example App

Replace your `src/index.tsx` with this minimal example:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { AuthWrapper } from './components/auth';
import './components/auth/auth.css';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <AuthWrapper defaultView="signin" />
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Option B: Add to Existing App

See `src/App-with-auth-example.tsx` for integration patterns.

## 5. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and you should see the sign-in page!

## 6. Test Authentication

### Test Email Sign-Up

1. Click "Sign up" at the bottom
2. Enter a test email and password
3. Click "Create account"
4. Check your email for verification link
5. Click the verification link
6. You're authenticated! 🎉

### Test Google Sign-In (Optional)

1. First, enable Google OAuth in Supabase:
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Add OAuth credentials (see [AUTH_SETUP_GUIDE.md](../docs/AUTH_SETUP_GUIDE.md))
2. Click "Continue with Google"
3. Authenticate with your Google account
4. You're in! 🎉

## Next Steps

### Customize the Look

1. **Change colors** - Open `SignIn.tsx` and replace `emerald` with your brand color:
   ```tsx
   // Find:
   className="bg-emerald-600"

   // Replace with:
   className="bg-blue-600"  // or any color
   ```

2. **Update hero text** - Edit the `HeroSection` component:
   ```tsx
   <HeroSection
     title="Your Custom Title"
     description="Your custom description"
   />
   ```

### Add User Profile

```tsx
import { useAuth } from './contexts/AuthContext';

function UserProfile() {
  const { user, signOut } = useAuth();

  return (
    <div className="p-4">
      <h1>Welcome, {user?.email}!</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Protect Routes

```tsx
import { ProtectedRoute } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute fallback={<AuthWrapper />}>
        <YourProtectedApp />
      </ProtectedRoute>
    </AuthProvider>
  );
}
```

## Troubleshooting

### "Supabase credentials are missing"

**Fix**: Make sure `.env.local` exists with the correct variables and restart the dev server.

### Sign-up email not received

**Fix**: Check your spam folder. For development, you can disable email confirmation:
1. Supabase Dashboard → **Authentication** → **Settings**
2. Disable **"Enable email confirmations"**
3. Users will be logged in immediately after sign-up

### Google sign-in not working

**Fix**: Make sure you've configured Google OAuth in Supabase (see step 6 in Test Authentication above).

## Full Documentation

- [Complete Setup Guide](../docs/AUTH_SETUP_GUIDE.md) - Detailed setup instructions
- [Component README](./src/components/auth/README.md) - Component API reference
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth) - Supabase documentation

## Need Help?

- Check the browser console for error messages
- Review Supabase logs in your dashboard
- See the [troubleshooting section](../docs/AUTH_SETUP_GUIDE.md#troubleshooting) in the full guide

---

Happy authenticating! 🚀
