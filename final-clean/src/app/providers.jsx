'use client';

import { createContext, useContext } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useForum } from '@/lib/hooks/useForum';
import { useRoadmap } from '@/lib/hooks/useRoadmap';

// Auth Context
const AuthContext = createContext(undefined);
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

// Forum Context
const ForumContext = createContext(undefined);
export function useForumContext() {
  const ctx = useContext(ForumContext);
  if (!ctx) throw new Error('useForumContext must be used within ForumProvider');
  return ctx;
}

// Roadmap Context
const RoadmapContext = createContext(undefined);
export function useRoadmapContext() {
  const ctx = useContext(RoadmapContext);
  if (!ctx) throw new Error('useRoadmapContext must be used within RoadmapProvider');
  return ctx;
}

export function Providers({ children }) {
  const auth = useAuth();
  const forum = useForum();
  const roadmap = useRoadmap();

  return (
    <AuthContext.Provider value={auth}>
      <ForumContext.Provider value={forum}>
        <RoadmapContext.Provider value={roadmap}>
          {children}
        </RoadmapContext.Provider>
      </ForumContext.Provider>
    </AuthContext.Provider>
  );
}
