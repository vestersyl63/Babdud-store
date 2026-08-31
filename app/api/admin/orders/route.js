import { db, adminSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export async function GET(req) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || '';
  let rows;
  if (status) {
    rows = db
      .prepare(
        `SELECT o.*, u.username, u.phone FROM orders o LEFT JOIN users u ON u.id = o.user_id
         WHERE o.status = ? ORDER BY o.created_at DESC, o.id DESC`
      )
      .all(status);
  } else {
    rows = db
      .prepare(
        `SELECT o.*, u.username, u.phone FROM orders o LEFT JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC, o.id DESC`
      )
      .all();
  }
  return json({ orders: rows });
}
