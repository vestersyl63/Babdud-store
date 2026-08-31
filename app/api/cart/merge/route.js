import { db, customerSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export async function POST(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in first.', 401);
  const { items = [] } = await req.json();
  const up = db.prepare(
    `INSERT INTO cart_items (owner, product_id, qty) VALUES (?,?,?)
     ON CONFLICT(owner, product_id) DO UPDATE SET qty = MIN(cart_items.qty + excluded.qty, 99)`
  );
  for (const it of items) {
    const p = db.prepare('SELECT stock FROM products WHERE id = ? AND active = 1').get(it.product_id);
    if (!p || p.stock <= 0) continue;
    up.run(`u${user.id}`, it.product_id, Math.min(Number(it.qty) || 1, p.stock));
  }
  return json({ ok: true });
}
