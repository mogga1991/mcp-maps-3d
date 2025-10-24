# Authentication Flow Diagram

Visual representation of how the logout button integrates with the auth system.

## Complete User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER VISITS APPLICATION                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  AuthProvider  │
                    │  checks session │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────┐          ┌──────────────┐
        │ No Session   │          │ Has Session  │
        └──────┬───────┘          └──────┬───────┘
               │                         │
               ▼                         ▼
     ┌──────────────────┐      ┌──────────────────┐
     │   AuthWrapper    │      │  MapApp Renders  │
     │  (Login/SignUp)  │      │                  │
     └────────┬─────────┘      └────────┬─────────┘
              │                         │
              │                         │
              │                         ▼
              │              ┌─────────────────────┐
              │              │  User uses app...   │
              │              │  - Search properties │
              │              │  - Save properties   │
              │              │  - Upload RLPs       │
              │              └──────────┬──────────┘
              │                         │
              │                         ▼
              │              ┌─────────────────────┐
              │              │ User clicks LOGOUT  │
              │              │  button (sidebar)   │
              │              └──────────┬──────────┘
              │                         │
              │                         ▼
              │              ┌─────────────────────┐
              │              │  _handleLogout()    │
              │              │   (map_app.ts)      │
              │              └──────────┬──────────┘
              │                         │
              │                         ▼
              │              ┌─────────────────────┐
              │              │ window.handleLogout │
              │              │      called         │
              │              └──────────┬──────────┘
              │                         │
              │                         ▼
              │              ┌─────────────────────┐
              │              │   signOut() from    │
              │              │   AuthContext       │
              │              └──────────┬──────────┘
              │                         │
              │                         ▼
              │              ┌─────────────────────┐
              │              │  Session cleared    │
              │              │  via Supabase       │
              │              └──────────┬──────────┘
              │                         │
              └─────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  AuthWrapper   │
                    │  shows again   │
                    └────────────────┘
```

## Component Interaction Map

```
┌──────────────────────────────────────────────────────────────────┐
│                        index.tsx                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                     AuthProvider                            │  │
│  │  (Manages global auth state)                               │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │               AuthWrapper                             │  │  │
│  │  │  (Shows SignIn/SignUp when user = null)              │  │  │
│  │  │                                                        │  │  │
│  │  │  ┌──────────────┐     ┌──────────────┐              │  │  │
│  │  │  │    SignIn    │ ←→  │    SignUp    │              │  │  │
│  │  │  └──────────────┘     └──────────────┘              │  │  │
│  │  │         │                     │                       │  │  │
│  │  │         └─────────┬───────────┘                       │  │  │
│  │  │                   │                                   │  │  │
│  │  │                   ▼                                   │  │  │
│  │  │         ┌──────────────────┐                         │  │  │
│  │  │         │  User logs in    │                         │  │  │
│  │  │         │  Session created │                         │  │  │
│  │  │         └────────┬─────────┘                         │  │  │
│  │  │                  │                                    │  │  │
│  │  └──────────────────┼────────────────────────────────────┘  │  │
│  │                     │                                       │  │
│  │  ┌──────────────────▼────────────────────────────────────┐  │  │
│  │  │        AuthenticatedMapApp                            │  │  │
│  │  │  (Only renders when user is authenticated)           │  │  │
│  │  │                                                        │  │  │
│  │  │  Sets: window.handleLogout = () => signOut()         │  │  │
│  │  │                                                        │  │  │
│  │  │  ┌──────────────────────────────────────────────┐    │  │  │
│  │  │  │            MapApp Component                   │    │  │  │
│  │  │  │         (Your existing app)                   │    │  │  │
│  │  │  │                                                │    │  │  │
│  │  │  │  ┌──────────────────────────────────────┐    │    │  │  │
│  │  │  │  │          Sidebar                     │    │    │  │  │
│  │  │  │  │                                       │    │    │  │  │
│  │  │  │  │  [Logo]                              │    │    │  │  │
│  │  │  │  │  [Search]                            │    │    │  │  │
│  │  │  │  │  [Saved]                             │    │    │  │  │
│  │  │  │  │                                       │    │    │  │  │
│  │  │  │  │  [Theme]                             │    │    │  │  │
│  │  │  │  │  [Settings]                          │    │    │  │  │
│  │  │  │  │  [LOGOUT] ──────────────────────┐    │    │    │  │  │
│  │  │  │  └───────────────────────────┬────┘    │    │    │  │  │
│  │  │  │                              │         │    │    │  │  │
│  │  │  │                              ▼         │    │    │  │  │
│  │  │  │                   @click=${this._handleLogout}    │  │  │
│  │  │  │                              │         │    │    │  │  │
│  │  │  │                              ▼         │    │    │  │  │
│  │  │  │                    ┌──────────────┐   │    │    │  │  │
│  │  │  │                    │_handleLogout()   │    │    │  │  │
│  │  │  │                    └────────┬─────┘   │    │    │  │  │
│  │  │  │                             │         │    │    │  │  │
│  │  │  │                             ▼         │    │    │  │  │
│  │  │  │                  window.handleLogout()│    │    │  │  │
│  │  │  └─────────────────────────┬─────────────┘    │    │  │  │
│  │  │                            │                  │    │  │  │
│  │  └────────────────────────────┼──────────────────┘    │  │  │
│  │                               │                       │  │  │
│  │                               ▼                       │  │  │
│  │                    ┌────────────────────┐            │  │  │
│  │                    │   signOut()        │            │  │  │
│  │                    │   (AuthContext)    │            │  │  │
│  │                    └──────────┬─────────┘            │  │  │
│  │                               │                       │  │  │
│  │                               ▼                       │  │  │
│  │                    ┌────────────────────┐            │  │  │
│  │                    │  Supabase.auth     │            │  │  │
│  │                    │    .signOut()      │            │  │  │
│  │                    └──────────┬─────────┘            │  │  │
│  │                               │                       │  │  │
│  └───────────────────────────────┼───────────────────────┘  │
│                                  │                          │
│                                  ▼                          │
│                       User state = null                     │
│                       AuthWrapper shows                     │
└──────────────────────────────────────────────────────────────┘
```

## File Structure with Changes

```
frontend/src/
├── index.tsx (or index-with-auth.tsx)
│   ├── Imports AuthProvider, AuthWrapper
│   ├── Wraps app in <AuthProvider>
│   ├── Sets window.handleLogout
│   └── Conditionally renders MapApp when authenticated
│
├── map_app.ts ⭐ UPDATED
│   ├── Added: @click handler on logout button
│   └── Added: _handleLogout() method
│
├── components/auth/
│   ├── SignIn.tsx          → Login page
│   ├── SignUp.tsx          → Registration page
│   ├── AuthWrapper.tsx     → Switches between SignIn/SignUp
│   ├── ProtectedRoute.tsx  → Guards routes
│   └── auth.css            → Animations
│
├── contexts/
│   └── AuthContext.tsx     → Manages auth state
│       ├── user: User | null
│       ├── signIn()
│       ├── signUp()
│       └── signOut() ⭐ Called by logout button
│
└── lib/
    └── supabase.ts         → Supabase client
```

## Data Flow on Logout

```
┌──────────────┐
│ User clicks  │
│ logout btn   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Button click event   │
│ @click handler       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ _handleLogout()      │
│ (map_app.ts:1195)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Check if             │
│ window.handleLogout  │
│ exists               │
└──────┬───────────────┘
       │
       ├─ Yes ──────────────────────────┐
       │                                │
       │                                ▼
       │                    ┌─────────────────────┐
       │                    │ Call                │
       │                    │ window.handleLogout │
       │                    └──────┬──────────────┘
       │                           │
       │                           ▼
       │                    ┌─────────────────────┐
       │                    │ signOut() from      │
       │                    │ AuthContext         │
       │                    └──────┬──────────────┘
       │                           │
       │                           ▼
       │                    ┌─────────────────────┐
       │                    │ supabase.auth       │
       │                    │   .signOut()        │
       │                    └──────┬──────────────┘
       │                           │
       │                           ▼
       │                    ┌─────────────────────┐
       │                    │ Clear session       │
       │                    │ Clear cookies       │
       │                    │ Set user = null     │
       │                    └──────┬──────────────┘
       │                           │
       │                           ▼
       │                    ┌─────────────────────┐
       │                    │ AuthWrapper         │
       │                    │ shows login page    │
       │                    └─────────────────────┘
       │
       └─ No ───────────────────────────┐
                                        │
                                        ▼
                             ┌─────────────────────┐
                             │ Console.log         │
                             │ "No auth handler"   │
                             └─────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────┐
│            AuthContext (Global State)            │
├─────────────────────────────────────────────────┤
│                                                  │
│  State:                                         │
│  ├─ user: User | null                          │
│  ├─ session: Session | null                    │
│  └─ loading: boolean                           │
│                                                  │
│  Methods:                                       │
│  ├─ signIn(email, password)                    │
│  ├─ signUp(email, password, metadata)          │
│  ├─ signOut() ⭐                                │
│  └─ signInWithGoogle()                         │
│                                                  │
│  Effects:                                       │
│  └─ Listens to Supabase auth state changes     │
│                                                  │
└─────────────────────────────────────────────────┘
         │                    │
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│   AuthWrapper   │  │ MapApp Component │
│  (consumes auth)│  │  (consumes auth) │
└─────────────────┘  └─────────────────┘
```

## Quick Reference

### Logout Button Location
```
File: frontend/src/map_app.ts
Line: ~1564-1570

Button HTML:
<button
  class="sidebar-button"
  @click=${this._handleLogout}>
  ${ICON_LOGOUT}
</button>
```

### Logout Handler
```
File: frontend/src/map_app.ts
Line: ~1195-1205

Method:
private _handleLogout() {
  if ((window as any).handleLogout) {
    (window as any).handleLogout();
  }
}
```

### Global Logout Setup
```
File: frontend/src/index-with-auth.tsx
Line: ~247

Setup:
(window as any).handleLogout = async () => {
  await signOut();
};
```

---

**Visual Summary**: The logout button connects your MapApp to the authentication system through a global handler, ensuring users are smoothly returned to the login page when they sign out.
