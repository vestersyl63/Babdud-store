import { db, adminSession, productWithImages } from '@/lib/db.mjs';
import { json, err, slugify } from '@/lib/util.mjs';

export async function GET(req) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC, id DESC').all();
  return json({ products: rows.map(productWithImages) });
}

export function validateProduct(body) {
  if (!body.name?.trim()) return 'Product name is required.';
  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0) return 'Enter a valid price.';
  return null;
}

export async function POST(req) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const body = await req.json();
  const issue = validateProduct(body);
  if (issue) return err(issue);

  let slug = slugify(body.name);
  while (db.prepare('SELECT 1 ok FROM products WHERE slug = ?').get(slug)) slug += '-' + Math.floor(Math.random() * 90 + 10);

  const info = db
    .prepare(
      `INSERT INTO products (category_id, name, slug, description, price, previous_price, stock, specs, variations, active)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    )
    .run(
      body.category_id || null,
      body.name.trim(),
      slug,
      body.description || '',
      Math.round(price(body.price)),
      body.previous_price ? Math.round(price(body.previous_price)) : null,
      Number(body.stock) || 0,
      body.specs || '',
      body.variations || '',
      body.active === false ? 0 : 1
    );
  const insImg = db.prepare('INSERT INTO product_images (product_id, url, position) VALUES (?,?,?)');
  (body.images || []).forEach((url, i) => insImg.run(info.lastInsertRowid, url, i));
  return json({ id: info.lastInsertRowid, slug }, 201);
}

function price(n) {
  return Number(n) || 0;
}
