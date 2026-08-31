import { db, customerSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export async function POST(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in to write a review.', 401);
  const { product_id, rating, body } = await req.json();
  const stars = Number(rating);
  if (!stars || stars < 1 || stars > 5) return err('Pick a star rating from 1 to 5.');

  const purchased = db
    .prepare(
      `SELECT 1 ok FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'Cancelled'`
    )
    .get(user.id, product_id);
  if (!purchased) return err('You can review products you have ordered.', 403);
  const dup = db.prepare('SELECT 1 ok FROM reviews WHERE product_id = ? AND user_id = ?').get(product_id, user.id);
  if (dup) return err('You have already reviewed this product.', 409);

  db.prepare('INSERT INTO reviews (product_id, user_id, rating, body) VALUES (?,?,?,?)').run(
    product_id,
    user.id,
    stars,
    String(body || '').slice(0, 2000)
  );
  return json({ ok: true }, 201);
}
