'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '../providers';
import AuthPage from '../components/pages/AuthPage';

export default function AuthRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, isAuthenticated, user } = useAuthContext();

  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [authForm, setAuthForm] = useState({ username: '', name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (isAuthenticated) router.push(user?.role === 'admin' ? '/admin' : '/dashboard');
  }, [isAuthenticated, user, router]);

  const handleLogin = async () => {
    try {
      setAuthError('');
      await login(authForm.username, authForm.password);
      // redirect handled by useEffect above once user state updates
    } catch (e) {
      setAuthError(e.message || 'Login failed');
    }
  };

  const handleSignup = async () => {
    try {
      setAuthError('');
      await register(authForm.username, authForm.password, authForm.name, authForm.email);
      router.push('/dashboard');
    } catch (e) {
      setAuthError(e.message || 'Sign up failed');
    }
  };

  return (
    <AuthPage
      mode={mode}
      authForm={authForm}
      setAuthForm={setAuthForm}
      authError={authError}
      setAuthError={setAuthError}
      onLogin={handleLogin}
      onSignup={handleSignup}
      onBack={() => router.push('/')}
      onToggleMode={() => setMode(m => m === 'login' ? 'signup' : 'login')}
    />
  );
}
