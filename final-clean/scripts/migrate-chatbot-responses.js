/**
 * Migrate ChatBot Responses into Database
 * Usage: npm run migrate:chatbot
 * 
 * This script loads initial chatbot responses into the database.
 * You can add more responses anytime by inserting directly into the database.
 */

import { pool } from '../src/lib/pool.js';

// Define chatbot response patterns
const chatbotResponses = [
 // Greetings
 {
 keywords: ['hello', 'hi', 'hey', 'greetings', 'greeting'],
 response: "Hello! 👋 I'm PathBot, your career guidance assistant. I'm here to help you explore career paths, understand skills, and find learning resources. What would you like to know?",
 category: 'greeting',
 priority: 10
 },
 
 // Career information
 {
 keywords: ['career', 'path', 'careers', 'paths', 'career path', 'career paths'],
 response: " We offer guided career paths in:\n• Software Engineer\n• Data Scientist\n• Cybersecurity Specialist\n• UI/UX Design Expert\n\nEach path includes curated resources from Foundation to Job Preparation. Which career interests you?",
 category: 'career',
 priority: 9
 },
 
 // Skills and learning
 {
 keywords: ['skill', 'skills', 'learn', 'learning', 'develop', 'development', 'improve'],
 response: "📚 Our platform provides structured learning paths organized into 6 stages:\n Foundation\n🔧 Core Technical\n🛠️ Tools\n Projects\n Soft Skills\n Job Preparation\n\nEach stage has courses, articles, videos, projects, and challenges. What skill would you like to develop?",
 category: 'skills',
 priority: 9
 },
 
 // Stages/Levels explanation
 {
 keywords: ['stage', 'level', 'levels', 'stages', 'foundation', 'core technical', 'tools', 'projects'],
 response: " Our 6-Stage Learning Framework:\n\n **Foundation** - Core concepts and fundamentals\n🔧 **Core Technical** - Deep dive into technical skills\n🛠️ **Tools** - Practical tools and technologies\n **Projects** - Real-world projects and portfolio building\n **Soft Skills** - Communication, leadership, teamwork\n **Job Preparation** - Resume, interviews, job hunting\n\nProgress through at your own pace!",
 category: 'stages',
 priority: 8
 },
 
 // Resources
 {
 keywords: ['resource', 'resources', 'material', 'materials', 'content', 'courses', 'articles', 'books', 'docs'],
 response: "📖 Our resource library includes:\n• **Courses** - Full-length learning programs\n• **Articles** - In-depth blog posts and guides\n• **Books** - Recommended reading\n• **Documentation** - Official tech docs\n• **Tutorials** - Step-by-step guides\n• **Tools** - Recommended software\n• **Challenges** - Coding problems & competitions\n• **OpenSource** - Contribute to real projects\n\nEach is color-coded by stage. What type of resource are you looking for?",
 category: 'resources',
 priority: 8
 },
 
 // Timeline expectations
 {
 keywords: ['time', 'timeline', 'how long', 'duration', 'months', 'how much time', 'how long will it take'],
 response: "⏱️ **Timeline Expectations:**\n\nEach stage typically takes 2–4 months of consistent practice (studying 20-30 hours/week). This varies based on:\n• Your prior experience\n• Learning pace\n• Time invested weekly\n• Complexity of the career path\n\nRemember: Steady progress beats rushing! Focus on depth, not speed. What career are you targeting?",
 category: 'timeline',
 priority: 7
 },
 
 // Getting started
 {
 keywords: ['start', 'begin', 'begin', 'get started', 'started', 'how to start', 'getting started', 'first step', 'next step'],
 response: " **Getting Started Steps:**\n\n1. **Select a Career** - Choose from our 4 career paths\n2. **Take Assessment** - Gauge your current skill level\n3. **Generate Roadmap** - Get a personalized learning path\n4. **Start Learning** - Follow the recommended resources\n5. **Track Progress** - Mark skills as complete\n6. **Iterate** - Update and refine your roadmap\n\nReady? Select a career path to begin!",
 category: 'getting_started',
 priority: 9
 },
 
 // Help and general support
 {
 keywords: ['help', 'how', 'what can you', 'assist', 'support', 'feature', 'features', 'capabilities'],
 response: "🤝 **I can help with:**\n• Choosing a career path\n• Understanding learning stages\n• Finding optimal resources\n• Getting started guidance\n• Timeline and pacing advice\n• Career comparisons\n• Skill assessment tips\n• Motivation and support\n\nWhat would you like to know more about?",
 category: 'help',
 priority: 10
 },
 
 // Python questions
 {
 keywords: ['python', 'javascript', 'java', 'c++', 'rust', 'go', 'programming language'],
 response: "💻 **Programming Languages:**\n\nDifferent languages serve different purposes:\n• **Python** - Data Science, Backend, Automation\n• **JavaScript** - Frontend, Web, Full-stack\n• **Java** - Enterprise, Android, Backend\n• **C++** - Systems, Performance-critical apps\n• **Rust** - Systems, Safety-critical\n\nYour career path will guide which languages to learn first. Which career are you interested in?",
 category: 'programming',
 priority: 6
 },
 
 // Difficulty and prerequisites
 {
 keywords: ['difficult', 'hard', 'easy', 'prerequisite', 'background', 'no experience', 'beginner', 'experience'],
 response: "✨ **Difficulty & Prerequisites:**\n\nOur paths are designed for beginners! No prior experience needed. Each stage starts from fundamentals and builds up.\n\n**If you're a complete beginner:**\n- Start with Foundation stage\n- Focus on learning mindset\n- Practice consistently\n- Don't skip concepts\n\n**If you have experience:**\n- Take our assessment\n- We'll skip what you know\n- Jump to your level\n\nReady to get assessed?",
 category: 'difficulty',
 priority: 7
 },
 
 // Career comparison
 {
 keywords: ['compare', 'comparison', 'difference', 'engineer vs', 'scientist vs', 'which career', 'which one'],
 response: "🔍 **Career Comparison:**\n\n**Software Engineer** - Building apps, systems, and tools\n**Data Scientist** - Analyzing data, ML, insights\n**Cybersecurity Specialist** - Protecting systems and data\n**UI/UX Designer** - Creating beautiful user experiences\n\nEach has different skills, pay, and job outlook. I'd recommend exploring all to see which excites you most. Any specific questions about these careers?",
 category: 'comparison',
 priority: 6
 },
 
 // Assessment
 {
 keywords: ['assessment', 'assess', 'quiz', 'test', 'evaluate', 'evaluate skills', 'skill assessment'],
 response: "📋 **Skill Assessment:**\n\nOur assessment helps determine:\n• Which stages you can skip\n• Your current skill level\n• Your starting point\n• Personalized recommendations\n\nIt's not a test—it's a tool to save you time! You might already know things that beginners need to learn.\n\nReady to take the assessment?",
 category: 'assessment',
 priority: 7
 },
 
 // Personalization
 {
 keywords: ['personalized', 'personalize', 'custom', 'customize', 'tailored', 'for me'],
 response: " **Personalized Learning:**\n\nBased on your career choice and skill assessment, we create a unique roadmap that:\n✓ Matches your skill level\n✓ Fits your pace\n✓ Includes relevant resources\n✓ Tracks your progress\n✓ Updates as you advance\n\nThis way, you only learn what matters for your goal!",
 category: 'personalization',
 priority: 7
 },
 
 // Default fallback response
 {
 keywords: ['other', 'default', 'unknown'],
 response: "🤔 That's an interesting question! I'm here to help with career guidance, learning paths, and skill development. You can ask me about:\n\n• Career paths and options\n• Learning stages and resources\n• Skill development\n• Getting started tips\n• Timeline expectations\n• Language recommendations\n\nWhat would you like to know?",
 category: 'fallback',
 priority: 0
 }
];

async function migrateResponses() {
 try {
 console.log('🤖 Starting chatbot responses migration...\n');
 
 // Check if responses already exist
 const result = await pool.query('SELECT COUNT(*) FROM chatbot_responses WHERE active = true');
 const existingCount = parseInt(result.rows[0].count, 10);
 
 if (existingCount > 0) {
 console.log(`ℹ️ Already have ${existingCount} active responses. Checking for new ones...\n`);
 }
 
 let insertedCount = 0;
 let skippedCount = 0;
 
 for (const resp of chatbotResponses) {
 try {
 // Check if this response category already exists
 const check = await pool.query(
 'SELECT id FROM chatbot_responses WHERE category = $1 AND active = true',
 [resp.category]
 );
 
 if (check.rows.length > 0) {
 console.log(`⏭️ Skipped: ${resp.category} (already exists)`);
 skippedCount++;
 continue;
 }
 
 // Insert new response
 await pool.query(
 `INSERT INTO chatbot_responses (keywords, response, category, priority, active)
 VALUES ($1, $2, $3, $4, true)`,
 [resp.keywords, resp.response, resp.category, resp.priority]
 );
 
 console.log(`[OK] Added: ${resp.category}`);
 insertedCount++;
 } catch (err) {
 console.error(`[ERROR] Error adding ${resp.category}:`, err.message);
 }
 }
 
 console.log(`\n[OK] Migration complete!`);
 console.log(` • Inserted: ${insertedCount}`);
 console.log(` • Skipped: ${skippedCount}`);
 
 // Show summary
 const total = await pool.query('SELECT COUNT(*) FROM chatbot_responses WHERE active = true');
 console.log(` • Total active responses: ${total.rows[0].count}\n`);
 
 process.exit(0);
 } catch (error) {
 console.error('[ERROR] Migration failed:', error);
 process.exit(1);
 }
}

migrateResponses();
