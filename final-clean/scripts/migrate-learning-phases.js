import { pool } from "../src/lib/pool.js";

const LEARNING_PHASES = [
 {
 name: "Foundation",
 icon: "",
 order_idx: 1,
 description: "Core concepts and fundamentals"
 },
 {
 name: "Core Technical",
 icon: "🔧",
 order_idx: 2,
 description: "Deep dive into technical skills"
 },
 {
 name: "Tools",
 icon: "🛠️",
 order_idx: 3,
 description: "Practical tools and technologies"
 },
 {
 name: "Projects",
 icon: "",
 order_idx: 4,
 description: "Real-world projects and portfolio"
 },
 {
 name: "Soft Skills",
 icon: "",
 order_idx: 5,
 description: "Communication, leadership, teamwork"
 },
 {
 name: "Job Preparation",
 icon: "",
 order_idx: 6,
 description: "Resume, interviews, job hunting"
 }
];

async function migrate() {
 const client = await pool.connect();
 try {
 await client.query("BEGIN");

 // Delete existing phases
 await client.query("DELETE FROM learning_phases");
 console.log("[OK] Cleared existing learning phases");

 // Insert new phases
 for (const phase of LEARNING_PHASES) {
 await client.query(
 `INSERT INTO learning_phases (name, icon, order_idx, description)
 VALUES ($1, $2, $3, $4)`,
 [phase.name, phase.icon, phase.order_idx, phase.description]
 );
 console.log(` ✓ Added: ${phase.name}`);
 }

 await client.query("COMMIT");
 console.log("[OK] Successfully migrated 6 learning phases");
 process.exit(0);
 } catch (e) {
 await client.query("ROLLBACK");
 console.error("[ERROR] Error:", e.message);
 process.exit(1);
 } finally {
 client.release();
 }
}

migrate();
