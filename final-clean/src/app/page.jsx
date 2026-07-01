'use client';

import { useRouter } from 'next/navigation';
import LandingPage from './components/pages/LandingPage';

export default function Home() {
  const router = useRouter();
  return (
    <LandingPage
      onSignup={() => router.push('/auth?mode=signup')}
      onLogin={() => router.push('/auth?mode=login')}
      onGuest={() => router.push('/guest')}
    />
  );
}
