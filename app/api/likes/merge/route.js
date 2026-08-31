import { db, customerSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export async function POST(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in first.', 401);
  const { product_ids = [] } = await req.json();
  const ins = db.prepare('INSERT OR IGNORE INTO likes (user_id, product_id) VALUES (?,?)');
  for (const id of product_ids) ins.run(user.id, id);
  return json({ ok: true });
}
