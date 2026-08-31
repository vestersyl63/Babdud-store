import { db, adminSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export async function GET(req) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const rows = db
    .prepare(
      `SELECT u.id, u.username, u.phone, u.provider, u.status, u.created_at,
        (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
       FROM users u ORDER BY u.created_at DESC`
    )
    .all();
  return json({ customers: rows });
}
