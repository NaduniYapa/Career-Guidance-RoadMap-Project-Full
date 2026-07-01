#!/usr/bin/env node

/**
 * Verification Script — Checks if database migration is complete
 * Run with: node scripts/verify-migration.js
 */

import { pool } from '../src/lib/pool.js';

async function verify() {
 console.log('\n🔍 Verifying database migration...\n');

 const checks = {
 'Tables exist': [],
 'Data populated': [],
 'Schema correct': [],
 'Foreign keys working': [],
 };

 try {
 // Check 1: Tables exist
 const tableRes = await pool.query(`
 SELECT table_name FROM information_schema.tables 
 WHERE table_schema = 'public' 
 AND table_name IN ('careers', 'levels', 'skills', 'user_careers', 'user_skills')
 `);
 const existingTables = tableRes.rows.map(r => r.table_name);
 
 checks['Tables exist'] = [
 { name: 'careers', status: existingTables.includes('careers') },
 { name: 'levels', status: existingTables.includes('levels') },
 { name: 'skills', status: existingTables.includes('skills') },
 { name: 'user_careers', status: existingTables.includes('user_careers') },
 { name: 'user_skills', status: existingTables.includes('user_skills') },
 ];

 // Check 2: Data populated
 const careerCount = (await pool.query('SELECT COUNT(*) as count FROM careers')).rows[0].count;
 const levelCount = (await pool.query('SELECT COUNT(*) as count FROM levels')).rows[0].count;
 const skillCount = (await pool.query('SELECT COUNT(*) as count FROM skills')).rows[0].count;

 checks['Data populated'] = [
 { name: 'At least 1 career', status: careerCount >= 1, actual: careerCount },
 { name: 'At least 6 levels', status: levelCount >= 6, actual: levelCount },
 { name: 'At least 50 skills', status: skillCount >= 50, actual: skillCount },
 ];

 // Check 3: Schema columns correct
 const skillColRes = await pool.query(`
 SELECT column_name, data_type FROM information_schema.columns
 WHERE table_name = 'user_skills'
 AND column_name IN ('skill_id', 'user_id', 'completed')
 `);
 const skillCols = skillColRes.rows;
 
 checks['Schema correct'] = [
 { name: 'user_skills.skill_id is integer', status: skillCols.some(c => c.column_name === 'skill_id' && c.data_type === 'integer') },
 { name: 'user_skills.completed is boolean', status: skillCols.some(c => c.column_name === 'completed' && c.data_type === 'boolean') },
 { name: 'No skill_name column in user_skills', status: !skillCols.some(c => c.column_name === 'skill_name') },
 ];

 // Check 4: Foreign keys working
 try {
 // Try to query through FK relationships
 const fkTest = await pool.query(`
 SELECT c.name, COUNT(l.id) as level_count
 FROM careers c
 LEFT JOIN levels l ON c.id = l.career_id
 GROUP BY c.id, c.name
 LIMIT 1
 `);
 
 checks['Foreign keys working'] = [
 { name: 'careers → levels FK functional', status: fkTest.rows.length > 0 },
 ];

 // Test skills FK
 const skillFkTest = await pool.query(`
 SELECT l.id, COUNT(s.id) as skill_count
 FROM levels l
 LEFT JOIN skills s ON l.id = s.level_id
 GROUP BY l.id
 LIMIT 1
 `);
 checks['Foreign keys working'].push({ 
 name: 'levels → skills FK functional', 
 status: skillFkTest.rows.length > 0 
 });
 } catch (e) {
 checks['Foreign keys working'] = [
 { name: 'FK relationships', status: false, error: e.message }
 ];
 }

 // Print results
 console.log(' Verification Results:\n');
 
 let allPassed = true;
 for (const [category, items] of Object.entries(checks)) {
 console.log(`${category}:`);
 for (const item of items) {
 const icon = item.status ? '[OK]' : '[ERROR]';
 const detail = item.actual !== undefined ? ` (${item.actual})` : '';
 const error = item.error ? ` - ${item.error}` : '';
 console.log(` ${icon} ${item.name}${detail}${error}`);
 if (!item.status) allPassed = false;
 }
 console.log();
 }

 if (allPassed) {
 console.log(' All checks passed! Database is ready.\n');
 console.log('Next steps:');
 console.log(' 1. npm run dev');
 console.log(' 2. Register a new user');
 console.log(' 3. Select a career and create a roadmap');
 console.log(' 4. Logout and login to verify persistence\n');
 process.exit(0);
 } else {
 console.log('[ERROR] Some checks failed. Run:\n');
 console.log(' node scripts/migrate-career-data.js\n');
 console.log('Then run this verification again.\n');
 process.exit(1);
 }

 } catch (error) {
 console.error('[ERROR] Verification error:', error.message);
 process.exit(1);
 } finally {
 await pool.end();
 }
}

verify();
