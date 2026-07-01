/**
 * Database Seed Script
 * Seeds the same demo users that existed in the in-memory UserRepository,
 * plus sample forum posts and replies.
 *
 * Run with: node scripts/seed-db.js
 * Requires: DATABASE_URL in .env.local
 */

import { config } from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';

config({ path: '.env.local' });

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
 console.error('[ERROR] DATABASE_URL not set in .env.local');
 process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function query(text, params) {
 return pool.query(text, params);
}

async function seed() {
 // [WARN] DEVELOPMENT ONLY - Don't run in production
 if (process.env.NODE_ENV === 'production') {
 console.error('[ERROR] Seed script should NOT be run in production!');
 console.log('[INFO] Use this script only in development/testing environments.');
 process.exit(1);
 }

 console.log(' Seeding database (DEVELOPMENT MODE)...\n');
 console.warn('[WARN] This script creates demo users and test data.');
 console.warn('[WARN] DO NOT run this in production!\n');

 try {
 // ── Passwords ──────────────────────────────────────────────
 const adminHash = await bcrypt.hash('admin123', 10);
 const studentHash = await bcrypt.hash('student123', 10);
 const profHash = await bcrypt.hash('prof123', 10);

 // ── Users ──────────────────────────────────────────────────
 console.log('👤 Creating users...');

 const userRows = [
 // admin
 ['admin', 'Admin', 'admin@pathforge.io', adminHash, 'admin', null, null, null, '⚙️'],
 // student
 ['student', 'Alex Student', 'alex@student.com', studentHash, 'student', null, null, null, null],
 // professionals — matching the original UserRepository seed data
 ['dr.dharmasekara', 'Mr. D. Dharamasekara', 'dharma@hfx.com', profHash, 'professional', 'Senior Software Engineer', 'HFX', 'Software Engineer', '👨‍💻'],
 ['dr.sekara', 'Mr. D.B. Sekara', 'sekara@uom.lk', profHash, 'professional', 'Professor, CS & Engineering', 'University of Moratuwa', 'Data Scientist', '👨‍🏫'],
 ['ms.fernando', 'Ms. R. Fernando', 'fernando@wso2.com', profHash, 'professional', 'Data Science Lead', 'WSO2', 'Data Scientist', '👩‍🔬'],
 ['mr.jayawardena', 'Mr. K. Jayawardena', 'jayawardena@codegen.com',profHash, 'professional', 'Cybersecurity Consultant', 'CodeGen International', 'Cybersecurity Analyst', '👨‍'],
 ];

 const insertedUsers = {};
 for (const [username, name, email, password_hash, role, title, org, specialty, avatar] of userRows) {
 const r = await query(
 `INSERT INTO users (username, name, email, password_hash, role, title, org, specialty, avatar)
 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
 ON CONFLICT (username) DO NOTHING
 RETURNING id, username`,
 [username, name, email, password_hash, role, title, org, specialty, avatar]
 );
 if (r.rows[0]) {
 insertedUsers[username] = r.rows[0].id;
 console.log(` [OK] ${role.padEnd(12)} ${username}`);
 } else {
 console.log(` [WARN] ${username} already exists, skipped`);
 const existing = await query('SELECT id FROM users WHERE username=$1', [username]);
 if (existing.rows[0]) insertedUsers[username] = existing.rows[0].id;
 }
 }

 // ── Forum posts ────────────────────────────────────────────
 console.log('\n💬 Creating sample forum posts...');

 const posts = [
 ['user_demo', 'Alex Chen', 'Software Engineer', "What's the best way to approach system design interviews?", 'dr.dharmasekara'],
 ['user_demo2', 'Priya S.', 'Data Scientist', 'Should I learn TensorFlow or PyTorch first?', null],
 ['user_demo3', 'Marcus T.', 'Cybersecurity Analyst','How important is getting CompTIA Security+ before looking for a job?', 'mr.jayawardena'],
 ['user_demo4', 'Sara K.', 'UI/UX Designer', 'What should I focus on to build a strong design portfolio as a beginner?', null],
 ];

 const insertedPosts = [];
 for (const [author_username, author_name, career, question, tagged_mentor] of posts) {
 const r = await query(
 `INSERT INTO forum_posts (author_username, author_name, career, question, tagged_mentor)
 VALUES ($1,$2,$3,$4,$5) RETURNING id`,
 [author_username, author_name, career, question, tagged_mentor]
 );
 insertedPosts.push(r.rows[0].id);
 console.log(` [OK] Post by ${author_name} in ${career}`);
 }

 // ── Replies ────────────────────────────────────────────────
 console.log('\n💭 Creating sample replies...');

 const replies = [
 [insertedPosts[0], 'dr.dharmasekara', 'Mr. D. Dharamasekara', 'Start with clarifying requirements, then think about scale. Draw the high-level architecture first, then dive deep into specific components. Practice on Excalidraw or a whiteboard.', true],
 [insertedPosts[2], 'mr.jayawardena', 'Mr. K. Jayawardena', 'Very important for entry-level. It signals foundational knowledge to employers. Get Security+ first, then aim for CySA+ or CEH after 1–2 years experience.', true],
 ];

 for (const [post_id, author_username, author_name, text, is_professional] of replies) {
 await query(
 `INSERT INTO forum_replies (post_id, author_username, author_name, text, is_professional)
 VALUES ($1,$2,$3,$4,$5)`,
 [post_id, author_username, author_name, text, is_professional]
 );
 console.log(` [OK] Reply by ${author_name}`);
 }

 // ── Notifications for professionals ───────────────────────
 console.log('\n🔔 Creating notifications...');

 // Notify dr.dharmasekara about the Software Engineer post
 if (insertedUsers['dr.dharmasekara'] && insertedPosts[0]) {
 await query(
 `INSERT INTO notifications (user_id, post_id, type, career, author_name, question)
 VALUES ($1,$2,$3,$4,$5,$6)`,
 [insertedUsers['dr.dharmasekara'], insertedPosts[0], 'new_question', 'Software Engineer', 'Alex Chen', "What's the best way to approach system design interviews?"]
 );
 console.log(' [OK] Notification → dr.dharmasekara');
 }

 // Notify mr.jayawardena about the Cybersecurity post
 if (insertedUsers['mr.jayawardena'] && insertedPosts[2]) {
 await query(
 `INSERT INTO notifications (user_id, post_id, type, career, author_name, question)
 VALUES ($1,$2,$3,$4,$5,$6)`,
 [insertedUsers['mr.jayawardena'], insertedPosts[2], 'new_question', 'Cybersecurity Analyst', 'Marcus T.', 'How important is getting CompTIA Security+ before looking for a job?']
 );
 console.log(' [OK] Notification → mr.jayawardena');
 }

 console.log('\n✨ Seeding complete!\n');
 console.log('🔐 Login credentials:');
 console.log(' Student: student / student123');
 console.log(' Professional: dr.dharmasekara / prof123');
 console.log(' Admin: admin / admin123\n');

 } catch (err) {
 console.error('[ERROR] Seed failed:', err.message);
 process.exit(1);
 } finally {
 await pool.end();
 }
}

seed();
