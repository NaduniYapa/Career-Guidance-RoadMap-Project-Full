/**
 * Migration Script — Populates careers, levels, and skills from careerData.js into database
 * Run with: node scripts/migrate-career-data.js
 */

import { pool } from '../src/lib/pool.js';
import CAREER_DATA from '../src/lib/data/careerData.js';

async function migrate() {
 const client = await pool.connect();
 try {
 await client.query('BEGIN');

 // Truncate existing data (in correct order due to FK constraints)
 await client.query('DELETE FROM user_skills');
 await client.query('DELETE FROM skills');
 await client.query('DELETE FROM levels');
 await client.query('DELETE FROM careers');
 console.log('[OK] Cleared existing career data');

 // Iterate through each career
 for (const [careerName, careerData] of Object.entries(CAREER_DATA)) {
 console.log(`\n📚 Inserting career: ${careerName}`);

 // Insert career
 const careerRes = await client.query(
 `INSERT INTO careers (name, description, icon, color, accent)
 VALUES ($1, $2, $3, $4, $5)
 RETURNING id`,
 [careerName, careerData.description, careerData.icon, careerData.color, careerData.accent]
 );
 const careerId = careerRes.rows[0].id;
 console.log(` ✓ Career created with ID: ${careerId}`);

 // Group skills by stage
 const skillsByStage = {};
 careerData.skills.forEach(skill => {
 if (!skillsByStage[skill.stage]) skillsByStage[skill.stage] = [];
 skillsByStage[skill.stage].push(skill);
 });

 // Define stage order
 const stageOrder = ['Foundation', 'Core Technical', 'Tools', 'Projects', 'Soft Skills', 'Job Preparation'];
 let orderIndex = 1;

 for (const stage of stageOrder) {
 if (!skillsByStage[stage]) continue;

 // Insert level (stage)
 const levelRes = await client.query(
 `INSERT INTO levels (career_id, name, order_index)
 VALUES ($1, $2, $3)
 RETURNING id`,
 [careerId, stage, orderIndex++]
 );
 const levelId = levelRes.rows[0].id;
 console.log(` ✓ Level "${stage}" created with ID: ${levelId}`);

 // Insert skills for this level
 for (const skill of skillsByStage[stage]) {
 const resources = skill.resources || [];
 await client.query(
 `INSERT INTO skills (level_id, name, weight, resources)
 VALUES ($1, $2, $3, $4)`,
 [levelId, skill.name, skill.weight, JSON.stringify(resources)]
 );
 }
 console.log(` ✓ ${skillsByStage[stage].length} skills inserted for "${stage}"`);
 }
 }

 await client.query('COMMIT');
 console.log('\n[OK] Migration completed successfully!');
 } catch (err) {
 await client.query('ROLLBACK');
 console.error('[ERROR] Migration failed:', err.message);
 process.exit(1);
 } finally {
 client.release();
 await pool.end();
 }
}

migrate();
