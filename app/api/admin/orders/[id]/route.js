import { db, adminSession } from '@/lib/db.mjs';
import { json, err, ORDER_STATUSES } from '@/lib/util.mjs';

export async function GET(req, { params }) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const order = db.prepare('SELECT o.*, u.username, u.phone FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE o.id = ?').get(params.id);
  if (!order) return err('Not found.', 404);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  let address = null;
  try {
    address = JSON.parse(order.address);
  } catch {}
  return json({ order: { ...order, address }, items });
}

export async function PUT(req, { params }) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const { status } = await req.json();
  if (!ORDER_STATUSES.includes(status)) return err('Invalid status.');
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(params.id);
  if (!order) return err('Not found.', 404);

  // restock if cancelling a non-cancelled order
  if (status === 'Cancelled' && order.status !== 'Cancelled') {
    const items = db.prepare('SELECT product_id, qty FROM order_items WHERE order_id = ?').all(order.id);
    for (const it of items) {
      db.prepare('UPDATE products SET stock = stock + ?, sold = MAX(0, sold - ?) WHERE id = ?').run(it.qty, it.qty, it.product_id);
    }
  }
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, order.id);
  return json({ ok: true });
}
