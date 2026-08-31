import { db, customerSession, adminSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export async function GET(req, { params }) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_no = ?').get(params.id, params.id);
  if (!order) return err('Order not found.', 404);
  const user = customerSession(req);
  const admin = adminSession(req);
  if (!admin && (!user || order.user_id !== user.id)) return err('Not allowed.', 403);

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  let address = null;
  try {
    address = JSON.parse(order.address);
  } catch {}
  return json({ order: { ...order, address }, items });
}
