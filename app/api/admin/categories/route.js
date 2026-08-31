import { db, adminSession } from '@/lib/db.mjs';
import { json, err, slugify } from '@/lib/util.mjs';

export async function POST(req) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const { name, blurb } = await req.json();
  if (!name?.trim()) return err('Category name required.');
  const slug = slugify(name);
  try {
    const info = db.prepare('INSERT INTO categories (name, slug, blurb) VALUES (?,?,?)').run(name.trim(), slug, blurb || '');
    return json({ id: info.lastInsertRowid }, 201);
  } catch {
    return err('Category already exists.', 409);
  }
}

export async function PUT(req) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const { id, name, blurb } = await req.json();
  if (!name?.trim()) return err('Category name required.');
  db.prepare('UPDATE categories SET name = ?, slug = ?, blurb = ? WHERE id = ?').run(name.trim(), slugify(name), blurb || '', id);
  return json({ ok: true });
}

export async function DELETE(req) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const used = db.prepare('SELECT COUNT(*) c FROM products WHERE category_id = ?').get(id).c;
  if (used > 0) return err(`Cannot delete — ${used} product(s) use this category.`, 409);
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  return json({ ok: true });
}
