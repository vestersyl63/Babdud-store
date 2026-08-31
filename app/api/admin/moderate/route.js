import { db, adminSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const reviews = db
    .prepare(
      `SELECT r.id, r.rating, r.body, r.created_at, u.username, p.name AS product, p.slug
       FROM reviews r JOIN users u ON u.id = r.user_id JOIN products p ON p.id = r.product_id
       ORDER BY r.created_at DESC LIMIT 20`
    )
    .all();
  const comments = db
    .prepare(
      `SELECT c.id, c.body, c.created_at, u.username, p.name AS product, p.slug
       FROM comments c JOIN users u ON u.id = c.user_id JOIN products p ON p.id = c.product_id
       ORDER BY c.created_at DESC LIMIT 20`
    )
    .all();
  return json({ reviews, comments });
}
