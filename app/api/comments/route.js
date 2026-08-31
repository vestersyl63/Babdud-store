import { db, customerSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export async function POST(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in to comment.', 401);
  const { product_id, body, parent_id } = await req.json();
  const text = String(body || '').trim();
  if (!text) return err('Comment cannot be empty.');
  if (text.length > 1000) return err('Comment is too long.');
  db.prepare('INSERT INTO comments (product_id, user_id, parent_id, body) VALUES (?,?,?,?)').run(
    product_id,
    user.id,
    parent_id || null,
    text
  );
  return json({ ok: true }, 201);
}
