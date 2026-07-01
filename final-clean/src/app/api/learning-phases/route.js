import { pool } from "@/lib/pool";

export async function GET(req) {
  try {
    const result = await pool.query(
      "SELECT id, name, icon, order_idx as \"orderIdx\", description FROM learning_phases ORDER BY order_idx"
    );
    return Response.json(result.rows, { status: 200 });
  } catch (e) {
    console.error("❌ GET /api/learning-phases error:", e);
    return Response.json({ error: 'Failed to fetch learning phases' }, { status: 500 });
  }
}
