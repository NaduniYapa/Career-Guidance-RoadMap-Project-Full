'use client';

import { useState, useCallback } from 'react';

export function useRoadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [knownSkills, setKnownSkills] = useState(new Set());
  const [completedSkills, setCompletedSkills] = useState(new Set());

  const toggleKnownSkill = useCallback((skill) => {
    setKnownSkills(prev => { const next = new Set(prev); next.has(skill) ? next.delete(skill) : next.add(skill); return next; });
  }, []);

  const toggleCompletedSkill = useCallback((skill) => {
    setCompletedSkills(prev => { const next = new Set(prev); next.has(skill) ? next.delete(skill) : next.add(skill); return next; });
  }, []);

  const setRoadmapData = useCallback((data) => { setRoadmap(data); }, []);

  const clearRoadmap = useCallback(() => {
    setRoadmap(null); setSelectedCareer(null);
    setKnownSkills(new Set()); setCompletedSkills(new Set());
  }, []);

  return {
    roadmap, selectedCareer, knownSkills, completedSkills,
    setRoadmap: setRoadmapData, setSelectedCareer,
    setKnownSkills, setCompletedSkills,
    toggleKnownSkill, toggleCompletedSkill, clearRoadmap,
  };
}
