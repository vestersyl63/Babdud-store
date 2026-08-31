import { db, customerSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

function cartPayload(userId) {
  const rows = db
    .prepare(
      `SELECT ci.product_id, ci.qty, p.name, p.price, p.stock, p.slug,
        (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.owner = ?`
    )
    .all(`u${userId}`);
  const items = rows.map((r) => ({
    product_id: r.product_id,
    qty: r.qty,
    product: { id: r.product_id, name: r.name, price: r.price, stock: r.stock, slug: r.slug, image: r.image },
  }));
  return { items, count: items.reduce((s, i) => s + i.qty, 0) };
}

export async function GET(req) {
  const user = customerSession(req);
  if (!user) return json({ items: [], count: 0 });
  return json(cartPayload(user.id));
}

export async function POST(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in to use the server cart.', 401);
  const { product_id, qty = 1 } = await req.json();
  const p = db.prepare('SELECT stock FROM products WHERE id = ? AND active = 1').get(product_id);
  if (!p) return err('Product not available.', 404);
  const existing = db.prepare('SELECT qty FROM cart_items WHERE owner = ? AND product_id = ?').get(`u${user.id}`, product_id);
  const newQty = Math.min((existing?.qty || 0) + Number(qty || 1), p.stock);
  if (newQty <= 0) return err('This product is out of stock.', 409);
  db.prepare(
    `INSERT INTO cart_items (owner, product_id, qty) VALUES (?,?,?)
     ON CONFLICT(owner, product_id) DO UPDATE SET qty = excluded.qty`
  ).run(`u${user.id}`, product_id, newQty);
  return json(cartPayload(user.id));
}

export async function PATCH(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in first.', 401);
  const { product_id, qty } = await req.json();
  if (qty <= 0) {
    db.prepare('DELETE FROM cart_items WHERE owner = ? AND product_id = ?').run(`u${user.id}`, product_id);
  } else {
    const p = db.prepare('SELECT stock FROM products WHERE id = ?').get(product_id);
    db.prepare('UPDATE cart_items SET qty = ? WHERE owner = ? AND product_id = ?').run(
      Math.min(qty, p?.stock || qty),
      `u${user.id}`,
      product_id
    );
  }
  return json(cartPayload(user.id));
}

export async function DELETE(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in first.', 401);
  const url = new URL(req.url);
  const pid = url.searchParams.get('product_id');
  if (pid) db.prepare('DELETE FROM cart_items WHERE owner = ? AND product_id = ?').run(`u${user.id}`, pid);
  else db.prepare('DELETE FROM cart_items WHERE owner = ?').run(`u${user.id}`);
  return json(cartPayload(user.id));
}
