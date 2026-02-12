'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, error, isLoading };
}

export function useRegister() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    setError(null);
    setIsLoading(true);
    try {
      await register(email, password, firstName, lastName);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { handleRegister, error, isLoading };
}

export function useLogout() {
  const { logout } = useAuth();
  return { logout };
}
