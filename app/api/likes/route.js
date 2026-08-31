import { db, customerSession, productWithImages } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export async function GET(req) {
  const user = customerSession(req);
  if (!user) return json({ likes: [] });
  const rows = db
    .prepare('SELECT product_id FROM likes WHERE user_id = ? ORDER BY created_at DESC')
    .all(user.id);
  const products = rows
    .map((r) => productWithImages(db.prepare('SELECT * FROM products WHERE id = ?').get(r.product_id)))
    .filter(Boolean);
  return json({ likes: products.map((p) => p.id), products });
}

export async function POST(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in to save wishlist.', 401);
  const { product_id } = await req.json();
  const exists = db.prepare('SELECT 1 ok FROM likes WHERE user_id = ? AND product_id = ?').get(user.id, product_id);
  if (exists) {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND product_id = ?').run(user.id, product_id);
    return json({ liked: false });
  }
  db.prepare('INSERT INTO likes (user_id, product_id) VALUES (?,?)').run(user.id, product_id);
  return json({ liked: true });
}
