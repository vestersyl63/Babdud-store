import { db } from '@/lib/db.mjs';
export const dynamic = 'force-dynamic';
import { json } from '@/lib/util.mjs';

export async function GET() {
  const cats = db.prepare('SELECT * FROM categories ORDER BY name').all();
  const counts = db.prepare(
    'SELECT category_id, COUNT(*) c FROM products WHERE active = 1 GROUP BY category_id'
  ).all();
  const map = Object.fromEntries(counts.map((r) => [r.category_id, r.c]));
  return json({ categories: cats.map((c) => ({ ...c, count: map[c.id] || 0 })) });
}
