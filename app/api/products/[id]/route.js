import { db, productWithImages, customerSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export async function GET(req, { params }) {
  const { id: key } = await params;
  let product = db.prepare('SELECT * FROM products WHERE slug = ?').get(key);
  if (!product && /^\d+$/.test(key)) product = db.prepare('SELECT * FROM products WHERE id = ?').get(key);
  if (!product || !product.active) return err('Product not found.', 404);

  const full = productWithImages(product);

  const reviews = db
    .prepare(
      `SELECT r.*, u.username, u.avatar FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ? ORDER BY r.created_at DESC`
    )
    .all(product.id);
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const comments = db
    .prepare(
      `SELECT c.*, u.username, u.avatar FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.product_id = ? ORDER BY c.created_at ASC`
    )
    .all(product.id);

  const related = db
    .prepare('SELECT * FROM products WHERE active = 1 AND category_id = ? AND id != ? ORDER BY created_at DESC LIMIT 4')
    .all(product.category_id || -1, product.id);

  const user = customerSession(req);
  const canReview = user
    ? db
        .prepare(
          `SELECT 1 ok FROM order_items oi JOIN orders o ON o.id = oi.order_id
           WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'Cancelled'`
        )
        .get(user.id, product.id)
    : null;
  const hasReviewed = user
    ? db.prepare('SELECT 1 ok FROM reviews WHERE product_id = ? AND user_id = ?').get(product.id, user.id)
    : null;

  return json({
    product: full,
    reviews,
    breakdown,
    comments,
    related: related.map(productWithImages),
    canReview: Boolean(canReview),
    hasReviewed: Boolean(hasReviewed),
  });
}
