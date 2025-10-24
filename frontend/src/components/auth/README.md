# Authentication Components

Beautiful, production-ready authentication components for your MCP Maps 3D application, built with Supabase, React, and Tailwind CSS.

## Features

- **Sign In & Sign Up** - Beautiful, responsive forms with your company branding
- **Email/Password Authentication** - Secure email-based authentication
- **Google OAuth** - One-click sign-in with Google
- **Protected Routes** - Easy-to-use route protection
- **Loading States** - Smooth loading experiences
- **Error Handling** - User-friendly error messages
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Company Branding** - Uses your emerald green (#10b981) color scheme
- **Animated Backgrounds** - Beautiful gradient animations on hero sections

## Components

### SignIn
The sign-in page with email/password and Google OAuth options.

```tsx
import { SignIn } from './components/auth';

<SignIn onSwitchToSignUp={() => navigate('/signup')} />
```

**Props:**
- `onSwitchToSignUp?: () => void` - Callback when user clicks "Sign up"

### SignUp
The sign-up page for new user registration.

```tsx
import { SignUp } from './components/auth';

<SignUp onSwitchToSignIn={() => navigate('/signin')} />
```

**Props:**
- `onSwitchToSignIn?: () => void` - Callback when user clicks "Sign in"

### AuthWrapper
A wrapper component that handles switching between sign-in and sign-up views.

```tsx
import { AuthWrapper } from './components/auth';

<AuthWrapper defaultView="signin" />
```

**Props:**
- `defaultView?: 'signin' | 'signup'` - Default view to show (default: 'signin')

### ProtectedRoute
A route wrapper that only renders children if user is authenticated.

```tsx
import { ProtectedRoute } from './components/auth';

<ProtectedRoute
  fallback={<AuthWrapper />}
  onUnauthenticated={() => navigate('/login')}
>
  <YourProtectedContent />
</ProtectedRoute>
```

**Props:**
- `children: React.ReactNode` - Content to show when authenticated
- `fallback?: React.ReactNode` - Content to show when not authenticated
- `onUnauthenticated?: () => void` - Callback when user is not authenticated

## Hooks

### useAuth
Access authentication state and methods throughout your app.

```tsx
import { useAuth } from '../../contexts/AuthContext';

function YourComponent() {
  const {
    user,           // Current user object or null
    session,        // Current session or null
    loading,        // Loading state
    signIn,         // Sign in function
    signUp,         // Sign up function
    signOut,        // Sign out function
    signInWithGoogle // Google OAuth function
  } = useAuth();

  return (
    <div>
      {user ? (
        <p>Welcome, {user.email}</p>
      ) : (
        <button onClick={() => signIn(email, password)}>
          Sign In
        </button>
      )}
    </div>
  );
}
```

**Methods:**

#### signIn
```tsx
const { error } = await signIn(email, password);
```

#### signUp
```tsx
const { error } = await signUp(email, password, {
  fullName: 'John Doe'
});
```

#### signOut
```tsx
await signOut();
```

#### signInWithGoogle
```tsx
const { error } = await signInWithGoogle();
```

## Styling

### Default Theme
The components use your company's emerald green color scheme:
- Primary: `#10b981` (emerald-600)
- Hover: `#059669` (emerald-700)
- Focus ring: `#10b981` (emerald-500)

### Customizing Colors

1. **Global color change** - Search and replace color classes:
   ```tsx
   // Find all instances of:
   bg-emerald-600
   text-emerald-600
   border-emerald-500
   focus:ring-emerald-500

   // Replace with your brand color:
   bg-blue-600
   text-blue-600
   border-blue-500
   focus:ring-blue-500
   ```

2. **CSS Variables** (if using custom CSS):
   ```css
   :root {
     --color-primary: #10b981;
     --color-primary-hover: #059669;
     --color-primary-light: #d1fae5;
   }
   ```

### Animations
The components include smooth animations:
- Blob animations on hero sections
- Fade-in transitions
- Smooth color transitions on hover

Import the CSS file for animations:
```tsx
import './components/auth/auth.css';
```

## Usage Examples

### Basic Setup
```tsx
import { AuthProvider } from './contexts/AuthContext';
import { AuthWrapper, ProtectedRoute } from './components/auth';
import './components/auth/auth.css';

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute fallback={<AuthWrapper />}>
        <YourMainApp />
      </ProtectedRoute>
    </AuthProvider>
  );
}
```

### With React Router
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignIn, SignUp, ProtectedRoute } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

### Access User Data
```tsx
function UserProfile() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <img src={user?.user_metadata?.avatar_url} alt="Avatar" />
      <h1>{user?.user_metadata?.full_name}</h1>
      <p>{user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Loading State
```tsx
function YourComponent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <Dashboard /> : <LandingPage />;
}
```

## File Structure

```
frontend/src/components/auth/
├── SignIn.tsx              # Sign in page component
├── SignUp.tsx              # Sign up page component
├── AuthWrapper.tsx         # Wrapper for switching views
├── ProtectedRoute.tsx      # Route protection component
├── auth.css                # Animation styles
├── index.ts                # Barrel exports
└── README.md               # This file

frontend/src/contexts/
└── AuthContext.tsx         # Auth context and provider

frontend/src/lib/
└── supabase.ts             # Supabase client setup
```

## Requirements

### Dependencies
```json
{
  "@supabase/supabase-js": "^2.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "lucide-react": "^0.x"
}
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Proper focus management
- Screen reader friendly
- High contrast mode compatible

## Security

- Passwords are never stored in component state longer than necessary
- All API calls use Supabase's secure endpoints
- CSRF protection built-in with Supabase
- Secure HTTP-only cookies for session management
- Password requirements enforced (min 6 characters)

## Troubleshooting

### Common Issues

**1. "Supabase credentials are missing"**
- Ensure `.env.local` exists with correct variables
- Restart dev server after adding variables
- Check variables start with `VITE_` prefix

**2. Google sign-in not working**
- Enable Google provider in Supabase dashboard
- Configure OAuth redirect URL correctly
- Check Google Cloud Console settings

**3. Styles not loading**
- Import `auth.css` in your app
- Verify Tailwind CSS is configured
- Check Lucide React is installed

See [AUTH_SETUP_GUIDE.md](../../../docs/AUTH_SETUP_GUIDE.md) for detailed setup instructions.

## License

This component library is part of the MCP Maps 3D project.

## Support

For issues and questions:
- Check the [Setup Guide](../../../docs/AUTH_SETUP_GUIDE.md)
- Review [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- Check browser console for errors
