'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export function useAuth() {
  const [state, setState] = useState({ user: null, isLoading: true, isAuthenticated: false, error: null });

  const refreshUser = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await apiClient.get('/auth/me');
      setState({ user: response.user, isLoading: false, isAuthenticated: true, error: null });
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = useCallback(async (username, password) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const response = await apiClient.post('/auth/login', { username, password });
    if (response.success && response.user) {
      setState({ user: response.user, isLoading: false, isAuthenticated: true, error: null });
    } else {
      setState(prev => ({ ...prev, isLoading: false, error: response.message || 'Login failed' }));
      throw new Error(response.message || 'Login failed');
    }
  }, []);

  const register = useCallback(async (username, password, name, email) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const response = await apiClient.post('/auth/register', { username, password, name, email });
    if (response.success && response.user) {
      setState({ user: response.user, isLoading: false, isAuthenticated: true, error: null });
    } else {
      setState(prev => ({ ...prev, isLoading: false, error: response.message || 'Registration failed' }));
      throw new Error(response.message || 'Registration failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try { await apiClient.post('/auth/logout'); } catch {}
    setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
  }, []);

  const clearError = useCallback(() => setState(prev => ({ ...prev, error: null })), []);

  return { ...state, login, register, logout, refreshUser, clearError };
}
