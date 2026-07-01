'use client';

import { useRouter } from 'next/navigation';
import { useAuthContext } from '../providers';
import AdminPanel from '../components/AdminPanel';
import { useEffect } from 'react';

export default function AdminRoute() {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) router.push('/dashboard');
  }, [isLoading, user, router]);

  if (!user) return null;
  return <AdminPanel currentUser={user} onBack={() => router.push('/')} />;
}
