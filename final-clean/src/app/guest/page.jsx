'use client';

import { useRouter } from 'next/navigation';
import GuestView from '../components/pages/GuestView';

export default function GuestRoute() {
  const router = useRouter();
  return (
    <GuestView
      onSignup={() => router.push('/auth?mode=signup')}
      onBack={() => router.push('/')}
    />
  );
}
