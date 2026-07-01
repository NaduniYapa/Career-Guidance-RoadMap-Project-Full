'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../providers';
import { useForumContext } from '../providers';
import { engine } from '@/engine';
import AppNavBar from '../components/AppNavBar';
import AdminPanel from '../components/AdminPanel';
import ProfessionalDashboard from '../components/ProfessionalDashboard';
import AssessmentPage from '../components/pages/AssessmentPage';
import CareerSelectionPage from '../components/pages/CareerSelectionPage';
import RoadmapTab from '../components/tabs/RoadmapTab';
import ExploreTab from '../components/tabs/ExploreTab';
import DiscussionPanel from '../components/DiscussionPanel';
import ChatBot from '../components/ChatBot';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { apiClient } from '@/lib/api-client';

export default function DashboardRoute() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthContext();
  const { posts: forumPosts, createPost, addReply } = useForumContext();

  const [view, setView] = useState('career_select');
  const [activeTab, setActiveTab] = useState('roadmap');
  const [showAdmin, setShowAdmin] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [assessedSkills, setAssessedSkills] = useState({});
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});
  const [expandedPost, setExpandedPost] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionCareer, setNewQuestionCareer] = useState('Software Engineer');
  const [taggedMentor, setTaggedMentor] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading your dashboard...');
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // ── Weight-based progress state ──────────────────────────────
  // completedSkills: { [skillName]: true } — skills ticked off on the roadmap
  const [completedSkills, setCompletedSkills] = useState({});
  // expandedSkill: "StageName-SkillName" key for the open SkillCard
  const [expandedSkill, setExpandedSkill] = useState(null);

  // ── Per-career progress persistence ─────────────────────────
  const saveCareerProgress = useCallback((careerName, skills) => {
    if (!careerName || !user?.username) return;
    localStorage.setItem(`career_progress_${user.username}_${careerName}`, JSON.stringify(skills));
  }, [user]);

  const loadCareerProgress = useCallback((careerName) => {
    if (!careerName || !user?.username) return {};
    try {
      return JSON.parse(localStorage.getItem(`career_progress_${user.username}_${careerName}`) || '{}');
    } catch { return {}; }
  }, [user]);

  // ── Weight-based progress: toggle a skill done/undone ────────
  // Persists to DB via PUT /api/roadmap/progress, then recalculates
  // weightCoverage and progressPercent live from the engine.
  const handleToggleCompleted = useCallback(async (skillName) => {
    const nowCompleted = !completedSkills[skillName];

    // Optimistic UI update
    setCompletedSkills(prev => ({ ...prev, [skillName]: nowCompleted }));

    // Persist to DB
    try {
      await apiClient.put('/roadmap/progress', { skill_name: skillName, completed: nowCompleted });
    } catch {
      // Roll back on failure
      setCompletedSkills(prev => ({ ...prev, [skillName]: !nowCompleted }));
      return;
    }

    // Recalculate roadmap stats (progress %, weight coverage) without rebuilding stages
    // IMPORTANT: Don't regenerate the roadmap as it will remove completed skills from view
    if (roadmap?.career && roadmap?.stages) {
      try {
        const updatedCompleted = { ...completedSkills, [skillName]: nowCompleted };

        let totalWeight = 0;
        let completedWeight = 0;
        let totalSkills = 0;
        let completedCount = 0;

        roadmap.stages.forEach(stage => {
          (stage.skills || []).forEach(skill => {
            totalSkills++;
            totalWeight += skill.weight || 5;
            if (updatedCompleted[skill.name]) {
              completedCount++;
              completedWeight += skill.weight || 5;
            }
          });
        });

        const progressPercent = totalSkills > 0 ? Math.round((completedCount / totalSkills) * 100) : 0;
        const weightCoverage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
        const totalRemaining = totalSkills - completedCount;

        // Update roadmap with recalculated stats, keeping original stages intact
        setRoadmap(prev => ({
          ...prev,
          progressPercent,
          weightCoverage,
          totalRemaining
        }));

        // Update localStorage backup
        localStorage.setItem(`roadmap_backup_${user.username}`, JSON.stringify({
          roadmap: {
            ...roadmap,
            progressPercent,
            weightCoverage,
            totalRemaining
          },
          completedSkills: updatedCompleted,
          selectedCareer: selectedCareer,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Failed to recalculate progress:', err);
      }
    }
  }, [completedSkills, roadmap, user, selectedCareer]);

  // Toggle skill card expand/collapse
  const handleToggleExpand = useCallback((expKey) => {
    setExpandedSkill(prev => prev === expKey ? null : expKey);
  }, []);

  // Redirect if not authenticated, or redirect admins straight to admin panel
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth');
    if (!isLoading && user?.role === 'admin') router.push('/admin');
  }, [isLoading, isAuthenticated, user, router]);

  // Load professionals, notifications, and restore saved progress on mount
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setDataLoading(true);
        setLoadingMessage('Loading your dashboard...');

        // Load professionals list
        setLoadingMessage('Loading mentors...');
        try {
          const r = await apiClient.get('/users/professionals');
          setProfessionals((r.professionals || []).map(p => [p.username, p]));
        } catch (error) {
          console.error('Failed to load professionals:', error);
          setProfessionals([]);
        }

        // Load notifications for professionals
        if (user.role === 'professional') {
          setLoadingMessage('Loading notifications...');
          try {
            const r = await apiClient.get('/notifications');
            setNotifications(r.notifications || []);
          } catch (error) {
            console.error('Failed to load notifications:', error);
            setNotifications([]);
          }
        }

        // Restore career + completed skills from DB
        setLoadingMessage('Restoring your progress...');
        try {
          const r = await apiClient.get(`/users/${user.username}`);
          if (r.career?.id) {
            setSelectedCareer(r.career.name);

            try {
              setLoadingMessage('Loading skill progress...');
              const progressRes = await apiClient.get('/roadmap/progress');
              const saved = {};
              (progressRes.progress || []).forEach(s => {
                if (s.completed) saved[s.skill_name] = true;
              });
              setCompletedSkills(saved);
              setAssessedSkills(saved);

              // Always regenerate roadmap for the saved career to restore dashboard state
              setLoadingMessage('Generating your roadmap...');
              const result = await apiClient.post('/roadmap/generate');
              if (result.roadmap) {
                setRoadmap(result.roadmap);
                setView('dashboard');
                return;
              }
            } catch (error) {
              console.error('Roadmap restore failed:', error);
              // Fallback to localStorage backup
              const backup = localStorage.getItem(`roadmap_backup_${user.username}`);
              if (backup) {
                try {
                  const data = JSON.parse(backup);
                  if (data.selectedCareer === r.career.name && data.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000) {
                    setRoadmap(data.roadmap);
                    setCompletedSkills(data.completedSkills);
                    setView('dashboard');
                    return;
                  }
                } catch (e) {
                  console.error('Backup load failed:', e);
                }
              }
            }

            // Fallback path: let user confirm assessment if roadmap restore fails
            setView('assessment');
          } else {
            // New user with no career selected
            setView('career_select');
          }
        } catch (error) {
          console.error('Failed to load user career data:', error);
          // User will start from career select if fetch fails
          setView('career_select');
        }
      } catch (error) {
        console.error('Data loading error:', error);
        setView('career_select');
      } finally {
        // Always stop loading, regardless of outcome
        setDataLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (isLoading || !user) return <LoadingOverlay message="Authenticating..." />;
  if (dataLoading) return <LoadingOverlay message={loadingMessage} />;
  if (isGeneratingRoadmap) return <LoadingOverlay message={loadingMessage} />;

  const isProfessional = user.role === 'professional';
  const isAdmin = user.role === 'admin';

  // ── Roadmap generation ───────────────────────────────────────
  const generateRoadmap = async () => {
    setIsGeneratingRoadmap(true);
    setLoadingMessage('Generating your personalized roadmap...');

    try {
      setLoadingMessage('Saving your career choice...');
      await apiClient.put(`/users/${user.username}`, { selected_career: selectedCareer });

      setLoadingMessage('Recording your existing skills...');
      const skillsPayload = Object.entries(assessedSkills)
        .filter(([, v]) => v)
        .map(([skill_name]) => ({ skill_name, completed: true }));
      await apiClient.post(`/users/${user.username}/skills`, { skills: skillsPayload });

      setLoadingMessage('Building your custom learning path...');
      const result = await apiClient.post('/roadmap/generate');
      setRoadmap(result.roadmap);

      // Seed completedSkills: merge previously saved progress + newly assessed skills
      const known = {};
      skillsPayload.forEach(s => { known[s.skill_name] = true; });
      const merged = { ...loadCareerProgress(selectedCareer), ...known };
      setCompletedSkills(merged);
      setView('dashboard');

      // Backup to localStorage
      localStorage.setItem(`roadmap_backup_${user.username}`, JSON.stringify({
        roadmap: result.roadmap,
        completedSkills: merged,
        selectedCareer,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Roadmap generation failed, using fallback:', e);
      // Fallback: generate client-side
      setLoadingMessage('Creating your roadmap...');
      const { UserProfile } = await import('@/lib/roadmap-engine');
      const knownSkills = Object.entries(assessedSkills).filter(([, v]) => v).map(([k]) => k);
      const profile = new UserProfile(user.name, selectedCareer, knownSkills);
      const clientRoadmap = engine.generateRoadmap(profile);
      setRoadmap(clientRoadmap);

      const known = {};
      knownSkills.forEach(s => { known[s] = true; });
      const merged = { ...loadCareerProgress(selectedCareer), ...known };
      setCompletedSkills(merged);
      setView('dashboard');

      // Backup to localStorage
      localStorage.setItem(`roadmap_backup_${user.username}`, JSON.stringify({
        roadmap: clientRoadmap,
        completedSkills: merged,
        selectedCareer,
        timestamp: Date.now()
      }));
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // ── Derived stats ────────────────────────────────────────────
  const progressPct = roadmap?.progressPercent ?? 0;
  const allProfessionals = professionals;
  const specialtyMentors = (career) => professionals.filter(([, u]) => u.specialty === career);

  const submitForumQuestion = async () => {
    if (!newQuestion.trim()) return;
    if (newQuestion.trim().length < 10) {
      alert('Question must be at least 10 characters long');
      return;
    }
    try {
      await createPost(newQuestion, newQuestionCareer, taggedMentor);
      setNewQuestion('');
      setTaggedMentor(null);
    } catch (error) {
      console.error('Failed to create post:', error);
      alert(error.message || 'Failed to create post');
    }
  };

  const submitReply = async (postId) => {
    const text = replyTexts[postId] || '';
    if (!text.trim()) return;
    try {
      await addReply(postId, text);
      setReplyTexts(p => ({ ...p, [postId]: '' }));
    } catch (error) {
      console.error('Failed to post reply:', error);
      alert(error.message || 'Failed to post reply');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Professional view
  if (isProfessional) {
    return (
      <ProfessionalDashboard
        currentUser={user}
        notifications={notifications}
        setNotifications={setNotifications}
        forumPosts={forumPosts}
        setForumPosts={() => {}}
        replyTexts={replyTexts}
        setReplyTexts={setReplyTexts}
        expandedPost={expandedPost}
        setExpandedPost={setExpandedPost}
        submitReply={submitReply}
        handleLogout={handleLogout}
      />
    );
  }

  // Admin panel overlay
  if (showAdmin) {
    return <AdminPanel currentUser={user} onBack={() => setShowAdmin(false)} />;
  }

  // Career selection
  if (view === 'career_select') {
    return (
      <CareerSelectionPage
        currentUser={user}
        isAdmin={isAdmin}
        onSelectCareer={(c) => { setSelectedCareer(c); setView('assessment'); }}
        onAdminOpen={() => setShowAdmin(true)}
        onLogout={handleLogout}
      />
    );
  }

  // Skill assessment
  if (view === 'assessment') {
    return (
      <AssessmentPage
        selectedCareer={selectedCareer}
        assessedSkills={assessedSkills}
        setAssessedSkills={setAssessedSkills}
        isEditMode={isEditMode}
        onConfirm={generateRoadmap}
        onBack={() => { setIsEditMode(false); setView(roadmap ? 'dashboard' : 'career_select'); }}
      />
    );
  }

  // Main dashboard
  return (
    <div style={{ minHeight: '100vh', background: '#0a0612', fontFamily: "'Georgia',serif" }}>
      <AppNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        roadmap={roadmap}
        progressPct={progressPct}
        currentUser={user}
        isProfessional={isProfessional}
        isAdmin={isAdmin}
        onAdminOpen={() => setShowAdmin(true)}
        onLogout={handleLogout}
      />
      {activeTab === 'roadmap' && (
        <RoadmapTab
          roadmap={roadmap}
          currentUser={user}
          completedSkills={completedSkills}
          expandedSkill={expandedSkill}
          onToggleCompleted={handleToggleCompleted}
          onToggleExpand={handleToggleExpand}
          onEditSkills={() => { setIsEditMode(true); setView('assessment'); }}
          onChangePath={() => { saveCareerProgress(roadmap?.career?.name || selectedCareer, completedSkills); setRoadmap(null); setCompletedSkills({}); setView('career_select'); }}
        />
      )}
      {activeTab === 'explore' && (
        <ExploreTab
          selectedCareer={roadmap?.career?.name || selectedCareer}
          onSelectCareer={(c) => { saveCareerProgress(roadmap?.career?.name || selectedCareer, completedSkills); setSelectedCareer(c); setAssessedSkills({}); setView('assessment'); }}
        />
      )}
      {activeTab === 'discussion' && (
        <DiscussionPanel
          currentUser={user}
          isProfessional={isProfessional}
          forumPosts={forumPosts}
          setForumPosts={() => {}}
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
          newQuestionCareer={newQuestionCareer}
          setNewQuestionCareer={setNewQuestionCareer}
          taggedMentor={taggedMentor}
          setTaggedMentor={setTaggedMentor}
          replyTexts={replyTexts}
          setReplyTexts={setReplyTexts}
          expandedPost={expandedPost}
          setExpandedPost={setExpandedPost}
          submitForumQuestion={submitForumQuestion}
          submitReply={submitReply}
          allProfessionals={allProfessionals}
          specialtyMentors={specialtyMentors}
        />
      )}
      <ChatBot />
    </div>
  );
}
