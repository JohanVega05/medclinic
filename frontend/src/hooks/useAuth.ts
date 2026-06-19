'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { User, AuthTokens } from '@/types';
import { queryClient } from '@/lib/queryClient';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get<User>('/auth/profile/');
      setUser(data);
      localStorage.setItem('user_role', data.role);
      return data;
    } catch {
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post<AuthTokens>('/auth/login/', { email, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    const profile = await fetchProfile();
    return profile;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    setUser(null);
    queryClient.clear();
    router.push('/auth/login');
  };

  const redirectByRole = (role: string) => {
    if (role === 'patient') router.push('/dashboard/patient');
    else if (role === 'doctor') router.push('/dashboard/doctor');
    else if (role === 'admin') router.push('/dashboard/admin');
  };

  return { user, loading, login, logout, redirectByRole, fetchProfile };
}