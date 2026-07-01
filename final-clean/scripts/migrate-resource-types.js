import { pool } from "../src/lib/pool.js";

const RESOURCE_TYPES = [
 { name: "Course", color: "#3b82f6", icon: "🎓" },
 { name: "Article", color: "#10b981", icon: "📰" },
 { name: "Video", color: "#f59e0b", icon: "🎬" },
 { name: "Book", color: "#8b5cf6", icon: "📖" },
 { name: "Docs", color: "#06b6d4", icon: "📚" },
 { name: "Tutorial", color: "#ec4899", icon: "" },
 { name: "Tool", color: "#f97316", icon: "🔧" },
 { name: "Challenges", color: "#ef4444", icon: "⚡" },
 { name: "OpenSource", color: "#22d3ee", icon: "🌍" }
];

async function migrate() {
 const client = await pool.connect();
 try {
 await client.query("BEGIN");

 // Delete existing resource types
 await client.query("DELETE FROM resource_types");
 console.log("[OK] Cleared existing resource types");

 // Insert new resource types
 for (const rt of RESOURCE_TYPES) {
 await client.query(
 `INSERT INTO resource_types (name, color, icon) VALUES ($1, $2, $3)`,
 [rt.name, rt.color, rt.icon]
 );
 console.log(` ✓ Added: ${rt.name}`);
 }

 await client.query("COMMIT");
 console.log("[OK] Successfully migrated 9 resource types");
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
