import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';

type AuthView = 'signin' | 'signup';

interface AuthWrapperProps {
  defaultView?: AuthView;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ defaultView = 'signin' }) => {
  const [currentView, setCurrentView] = useState<AuthView>(defaultView);

  return (
    <>
      {currentView === 'signin' ? (
        <SignIn onSwitchToSignUp={() => setCurrentView('signup')} />
      ) : (
        <SignUp onSwitchToSignIn={() => setCurrentView('signin')} />
      )}
    </>
  );
};

export default AuthWrapper;
