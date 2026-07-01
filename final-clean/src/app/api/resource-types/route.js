import { pool } from "@/lib/pool";

export async function GET(req) {
  try {
    const result = await pool.query(
      "SELECT id, name, color, icon FROM resource_types ORDER BY name"
    );
    return Response.json(result.rows, { status: 200 });
  } catch (e) {
    console.error("❌ GET /api/resource-types error:", e);
    return Response.json({ error: 'Failed to fetch resource types' }, { status: 500 });
  }
}
