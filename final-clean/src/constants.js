// Global constants and shared styles

export const darkBg = {
  minHeight: '100vh',
  background: '#0a0612',
};

export const inputBase = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '7px',
  padding: '10px 14px',
  color: '#fff',
  fontFamily: "'Georgia',serif",
  fontSize: '14px',
  outline: 'none',
};

// Legacy - prefer API endpoint
// Fetch from GET /api/learning-phases
// Keep for fallback/reference only - DO NOT use in new code
export const STAGES = [
  'Foundation',
  'Core Technical',
  'Tools',
  'Projects',
  'Soft Skills',
  'Job Preparation',
];

// Legacy - prefer API endpoint
// Fetch from GET /api/learning-phases
// Keep for fallback/reference only - DO NOT use in new code
export const STAGE_ICONS = {
  Foundation: '🌱',
  'Core Technical': '🔧',
  Tools: '🛠️',
  Projects: '🚀',
  'Soft Skills': '💼',
  'Job Preparation': '🎯',
};

// Legacy - prefer API endpoint
// Fetch from GET /api/resource-types
// Keep for fallback/reference only - DO NOT use in new code
export const RESOURCE_COLORS = {
  Course: '#3b82f6',
  Article: '#10b981',
  Video: '#f59e0b',
  Book: '#8b5cf6',
  Docs: '#06b6d4',
  Tutorial: '#ec4899',
  Tool: '#f97316',
  Challenges: '#ef4444',
  OpenSource: '#22d3ee',
};

// Legacy - chatbot responses loaded from database
// See GET /api/chatbot/respond
// Keep for fallback only - DO NOT use in new code
export function getChatbotResponse(userInput) {
  const input = userInput.toLowerCase();
  if (input.includes('hello') || input.includes('hi') || input.includes('hey'))
    return "Hello! I'm here to help you explore career paths and learning resources. What would you like to know?";
  if (input.includes('career') || input.includes('path'))
    return "We offer guided career paths in Software Engineering, Data Science, Cybersecurity, and UI/UX Design. Each path includes curated resources from Foundation to Job Preparation. What career are you interested in?";
  if (input.includes('skill') || input.includes('learn'))
    return "Our platform provides structured learning paths with resources organized by skill level. You can find courses, articles, videos, and projects for each stage. What skill would you like to develop?";
  if (input.includes('stage') || input.includes('level'))
    return "We organise learning into 6 stages:\n🌱 Foundation\n🔧 Core Technical\n🛠️ Tools\n🚀 Projects\n💼 Soft Skills\n🎯 Job Preparation";
  if (input.includes('resource') || input.includes('material'))
    return "Resources include Courses, Articles, Books, Docs, Tutorials, Tools, Challenges, and OpenSource projects. Each is colour-coded and organised by stage.";
  if (input.includes('time') || input.includes('how long'))
    return "Learning timelines vary based on your pace and prior experience. Generally, each stage might take 2–4 months of consistent practice. Steady progress is what matters!";
  if (input.includes('start') || input.includes('begin'))
    return "Great! Start by selecting a career path and completing the skill assessment — the engine will skip what you already know and generate a personalised roadmap from your starting point.";
  if (input.includes('help') || input.includes('how'))
    return "I can help with:\n• Choosing a career path\n• Understanding skill stages\n• Finding learning resources\n• Getting started advice\n• Timeline expectations\n\nWhat would you like to know more about?";
  return "That's an interesting question! I'm here to help with career guidance, learning paths, and skill development. Could you ask me something about careers, skills, or learning resources?";
}
