import fs from 'fs';
import path from 'path';
import { db, adminSession, productWithImages } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';
import { validateProduct } from '../route.js';

export async function GET(req, { params }) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const p = productWithImages(db.prepare('SELECT * FROM products WHERE id = ?').get(params.id));
  if (!p) return err('Not found.', 404);
  return json({ product: p });
}

export async function PUT(req, { params }) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const body = await req.json();
  const issue = validateProduct(body);
  if (issue) return err(issue);
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(params.id);
  if (!existing) return err('Not found.', 404);

  db.prepare(
    `UPDATE products SET category_id=?, name=?, description=?, price=?, previous_price=?, stock=?, specs=?, variations=?, active=? WHERE id=?`
  ).run(
    body.category_id || null,
    body.name.trim(),
    body.description || '',
    Math.round(Number(body.price) || 0),
    body.previous_price ? Math.round(Number(body.previous_price)) : null,
    Number(body.stock) || 0,
    body.specs || '',
    body.variations || '',
    body.active === false ? 0 : 1,
    params.id
  );

  if (Array.isArray(body.images)) {
    const old = db.prepare('SELECT url FROM product_images WHERE product_id = ?').all(params.id);
    db.prepare('DELETE FROM product_images WHERE product_id = ?').run(params.id);
    const ins = db.prepare('INSERT INTO product_images (product_id, url, position) VALUES (?,?,?)');
    body.images.forEach((url, i) => ins.run(params.id, url, i));
    // remove orphaned files
    for (const o of old) {
      if (!body.images.includes(o.url) && o.url.startsWith('/uploads/')) {
        try {
          fs.unlinkSync(path.join(process.cwd(), 'public', o.url));
        } catch {}
      }
    }
  }
  return json({ ok: true });
}

export async function DELETE(req, { params }) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const old = db.prepare('SELECT url FROM product_images WHERE product_id = ?').all(params.id);
  db.prepare('DELETE FROM products WHERE id = ?').run(params.id);
  for (const o of old) {
    if (o.url.startsWith('/uploads/')) {
      try {
        fs.unlinkSync(path.join(process.cwd(), 'public', o.url));
      } catch {}
    }
  }
  return json({ ok: true });
}
