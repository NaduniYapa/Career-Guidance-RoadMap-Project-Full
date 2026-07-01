/**
 * Roadmap Engine — business logic for career roadmap generation.
 * Used server-side by /api/roadmap/generate, and client-side for guest view.
 */

import CAREER_DATA from './data/careerData.js';

// Fallback data - fetch from /api/learning-phases in production
// Phases are now stored in database but keep fallback for offline mode
const PHASE_FALLBACK = [
  'Foundation',
  'Core Technical',
  'Tools',
  'Projects',
  'Soft Skills',
  'Job Preparation'
];

/**
 * Fetch learning phases from database API
 * @returns {Promise<string[]>} Array of phase names in order, or fallback if API fails
 */
export async function getLearningPhases() {
  try {
    const res = await fetch('/api/learning-phases');
    if (!res.ok) return PHASE_FALLBACK;
    const phases = await res.json();
    return phases.map(p => p.name);
  } catch (e) {
    console.warn('Failed to fetch learning phases, using fallback:', e.message);
    return PHASE_FALLBACK;
  }
}

export class Skill {
  #name; #stage; #weight; #resources;
  constructor({ name, stage, weight, resources }) {
    this.#name = name; this.#stage = stage;
    this.#weight = weight; this.#resources = resources || [];
  }
  get name()      { return this.#name; }
  get stage()     { return this.#stage; }
  get weight()    { return this.#weight; }
  get resources() { return this.#resources; }
}

export class Career {
  #name; #color; #accent; #icon; #description; #skills;
  constructor(name, rawData) {
    this.#name = name; this.#color = rawData.color; this.#accent = rawData.accent;
    this.#icon = rawData.icon; this.#description = rawData.description;
    this.#skills = rawData.skills.map(s => new Skill(s));
  }
  get name()        { return this.#name; }
  get color()       { return this.#color; }
  get accent()      { return this.#accent; }
  get icon()        { return this.#icon; }
  get description() { return this.#description; }
  get skills()      { return [...this.#skills]; }
  getSkillsByStage(stageName) { return this.#skills.filter(s => s.stage === stageName); }
  get stages() {
    const order = PHASE_FALLBACK; // Use fallback - async fetch should happen in RoadmapEngine
    return [...new Set(this.#skills.map(s => s.stage))].sort((a,b) => order.indexOf(a) - order.indexOf(b));
  }
  addSkill(skillData) { this.#skills.push(new Skill(skillData)); }
}

export class UserProfile {
  #name; #selectedCareer; #existingSkills;
  constructor(name, selectedCareer, existingSkills = []) {
    this.#name = name; this.#selectedCareer = selectedCareer;
    this.#existingSkills = existingSkills.map(s => s.toLowerCase().trim());
  }
  get name()           { return this.#name; }
  get selectedCareer() { return this.#selectedCareer; }
  get existingSkills() { return [...this.#existingSkills]; }
  hasSkill(skillName)  { return this.#existingSkills.includes(skillName.toLowerCase().trim()); }
  addSkill(skillName)  { const n = skillName.toLowerCase().trim(); if (!this.#existingSkills.includes(n)) this.#existingSkills.push(n); }
  removeSkill(skillName) { const n = skillName.toLowerCase().trim(); this.#existingSkills = this.#existingSkills.filter(s => s !== n); }
}

export class RoadmapStage {
  #stageName; #skills;
  constructor(stageName) { this.#stageName = stageName; this.#skills = []; }
  get stageName() { return this.#stageName; }
  get skills()    { return [...this.#skills]; }
  get isEmpty()   { return this.#skills.length === 0; }
  addSkill(skill) { this.#skills.push(skill); }
}

export class Roadmap {
  #career; #userProfile; #stages; #skippedSkills; #totalRequired;
  constructor(career, userProfile) {
    this.#career = career; this.#userProfile = userProfile;
    this.#stages = []; this.#skippedSkills = []; this.#totalRequired = 0;
  }
  get career()          { return this.#career; }
  get stages()          { return [...this.#stages]; }
  get skippedSkills()   { return [...this.#skippedSkills]; }
  get totalRequired()   { return this.#totalRequired; }
  get totalRemaining()  { return this.#stages.reduce((acc, s) => acc + s.skills.length, 0); }
  get progressPercent() { return this.#totalRequired === 0 ? 0 : Math.round((this.#skippedSkills.length / this.#totalRequired) * 100); }
  get weightCoverage()  {
    const totalW = this.#career.skills.reduce((a, s) => a + s.weight, 0);
    const skippedW = this.#skippedSkills.reduce((acc, name) => {
      const sk = this.#career.skills.find(s => s.name === name);
      return acc + (sk ? sk.weight : 0);
    }, 0);
    return totalW === 0 ? 0 : Math.round((skippedW / totalW) * 100);
  }
  addStage(stage)       { if (!stage.isEmpty) this.#stages.push(stage); }
  addSkippedSkill(name) { this.#skippedSkills.push(name); }
  setTotalRequired(n)   { this.#totalRequired = n; }
}

export class RoadmapEngine {
  #careers;
  constructor(careerData) {
    this.#careers = {};
    for (const [name, data] of Object.entries(careerData)) this.#careers[name] = new Career(name, data);
  }
  getCareer(name)    { return this.#careers[name] || null; }
  getCareerNames()   { return Object.keys(this.#careers); }
  getAllCareers()     { return Object.values(this.#careers); }
  addSkillToCareer(careerName, skillData) {
    const career = this.#careers[careerName];
    if (career) { career.addSkill(skillData); return true; }
    return false;
  }
  generateRoadmap(userProfile) {
    const career = this.getCareer(userProfile.selectedCareer);
    if (!career) throw new Error(`Career not found: ${userProfile.selectedCareer}`);
    const roadmap = new Roadmap(career, userProfile);
    roadmap.setTotalRequired(career.skills.length);
    const stageOrder = PHASE_FALLBACK;
    for (const stageName of stageOrder) {
      const stageSkills = career.getSkillsByStage(stageName);
      if (!stageSkills.length) continue;
      const stage = new RoadmapStage(stageName);
      [...stageSkills].sort((a, b) => b.weight - a.weight).forEach(skill => {
        if (userProfile.hasSkill(skill.name)) roadmap.addSkippedSkill(skill.name);
        else stage.addSkill(skill);
      });
      roadmap.addStage(stage);
    }
    return roadmap;
  }
  generateGuestRoadmap(careerName) {
    const career = this.getCareer(careerName);
    if (!career) return null;
    const roadmap = new Roadmap(career, null);
    roadmap.setTotalRequired(career.skills.length);
    const stageOrder = PHASE_FALLBACK;
    for (const stageName of stageOrder) {
      const stageSkills = career.getSkillsByStage(stageName);
      if (!stageSkills.length) continue;
      const stage = new RoadmapStage(stageName);
      [...stageSkills].sort((a, b) => b.weight - a.weight).forEach(skill => stage.addSkill(skill));
      roadmap.addStage(stage);
    }
    return roadmap;
  }
}

export const engine = new RoadmapEngine(CAREER_DATA);
export default engine;
