import { db, listProducts } from '@/lib/db.mjs';
export const dynamic = 'force-dynamic';
import { json } from '@/lib/util.mjs';

export async function GET(req) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const category = url.searchParams.get('category') || '';
  const sort = url.searchParams.get('sort') || 'new';
  const suggest = url.searchParams.get('suggest') === '1';

  if (suggest) {
    const rows = db
      .prepare(
        `SELECT p.id, p.slug, p.name, p.price,
          (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image
         FROM products p LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.active = 1 AND (p.name LIKE ? OR c.name LIKE ? OR p.description LIKE ?)
         ORDER BY p.sold DESC LIMIT 6`
      )
      .all(`%${q}%`, `%${q}%`, `%${q}%`);
    return json({ products: rows });
  }

  const products = listProducts({ q, categorySlug: category, sort });
  return json({ products });
}
