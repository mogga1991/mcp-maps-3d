/**
 * Auth Components Demo
 *
 * This demo component showcases all authentication components and their states.
 * Useful for:
 * - Testing the components
 * - Previewing the design
 * - Development reference
 *
 * To use this demo:
 * 1. Import it in your App.tsx
 * 2. Render <AuthDemo /> instead of your main app
 * 3. Explore all the auth states and components
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import SignIn from './SignIn';
import SignUp from './SignUp';
import ProtectedRoute from './ProtectedRoute';
import AuthWrapper from './AuthWrapper';
import './auth.css';

// Demo Dashboard - Shows what a logged-in user sees
function DemoDashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">MCP Maps 3D</h1>
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Authentication Successful! 🎉
            </h2>
            <p className="text-lg text-gray-600">
              You are now logged in to MCP Maps 3D
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Account Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User ID:</span>
                <span className="font-mono text-sm text-gray-900">{user?.id?.substring(0, 20)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Verified:</span>
                <span className="text-green-600 font-medium">
                  {user?.email_confirmed_at ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Signed up:</span>
                <span className="text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-emerald-50 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure Auth</h4>
              <p className="text-sm text-gray-600">Industry-standard security with Supabase</p>
            </div>

            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Fast & Reliable</h4>
              <p className="text-sm text-gray-600">Lightning-fast authentication flow</p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Customizable</h4>
              <p className="text-sm text-gray-600">Easy to match your brand</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Component showcase selector
type DemoView = 'signin' | 'signup' | 'wrapper' | 'protected';

export function AuthDemo() {
  const [view, setView] = useState<DemoView>('wrapper');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Demo Controls */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Auth Components Demo</h1>
                  <p className="text-sm text-gray-600">Preview all authentication components</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView('signin')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      view === 'signin'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setView('signup')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      view === 'signup'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setView('wrapper')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      view === 'wrapper'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Auth Wrapper
                  </button>
                  <button
                    onClick={() => setView('protected')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      view === 'protected'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Protected Route
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className="py-8">
          {view === 'signin' && <SignIn />}
          {view === 'signup' && <SignUp />}
          {view === 'wrapper' && <AuthWrapper defaultView="signin" />}
          {view === 'protected' && (
            <ProtectedRoute fallback={<AuthWrapper />}>
              <DemoDashboard />
            </ProtectedRoute>
          )}
        </div>

        {/* Instructions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 Demo Instructions
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• <strong>Sign In</strong> - Shows the sign-in page with email/password and Google OAuth</li>
              <li>• <strong>Sign Up</strong> - Shows the registration page with form validation</li>
              <li>• <strong>Auth Wrapper</strong> - Switches between sign-in and sign-up automatically</li>
              <li>• <strong>Protected Route</strong> - Shows protected content only when authenticated</li>
              <li>• Try creating an account to see the full flow!</li>
            </ul>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

export default AuthDemo;
