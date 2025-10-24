/**
 * Example App.tsx showing how to integrate authentication
 *
 * This is a sample file demonstrating how to integrate the auth components
 * into your existing application. Copy the relevant parts into your actual App.tsx
 */

import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthWrapper, ProtectedRoute } from './components/auth';
import './components/auth/auth.css';

// Your existing main app component
function MainApp() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with user info and sign out */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">MCP Maps 3D</h1>

            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Your existing app content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to MCP Maps 3D
          </h2>
          <p className="text-gray-600">
            You are now authenticated and can access the full application.
          </p>

          {/* Add your existing map component and other content here */}
        </div>
      </main>
    </div>
  );
}

// Main App component with auth wrapper
function App() {
  return (
    <AuthProvider>
      <ProtectedRoute
        fallback={<AuthWrapper defaultView="signin" />}
      >
        <MainApp />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;

/**
 * Alternative patterns:
 *
 * 1. Separate auth routes (with react-router):
 *
 * import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
 *
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <BrowserRouter>
 *         <Routes>
 *           <Route path="/login" element={<SignIn />} />
 *           <Route path="/signup" element={<SignUp />} />
 *           <Route
 *             path="/*"
 *             element={
 *               <ProtectedRoute fallback={<Navigate to="/login" />}>
 *                 <MainApp />
 *               </ProtectedRoute>
 *             }
 *           />
 *         </Routes>
 *       </BrowserRouter>
 *     </AuthProvider>
 *   );
 * }
 *
 * 2. Optional authentication (guest access allowed):
 *
 * function App() {
 *   const { user } = useAuth();
 *
 *   return (
 *     <AuthProvider>
 *       <MainApp />
 *       {!user && (
 *         <button onClick={() => setShowAuth(true)}>
 *           Sign In
 *         </button>
 *       )}
 *     </AuthProvider>
 *   );
 * }
 *
 * 3. Role-based access:
 *
 * function AdminRoute({ children }: { children: React.ReactNode }) {
 *   const { user } = useAuth();
 *   const isAdmin = user?.user_metadata?.role === 'admin';
 *
 *   if (!isAdmin) {
 *     return <Navigate to="/" />;
 *   }
 *
 *   return <>{children}</>;
 * }
 */
