import { db, customerSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export async function POST(req, { params }) {
  const user = customerSession(req);
  if (!user) return err('Sign in first.', 401);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(params.id);
  if (!order || order.user_id !== user.id) return err('Order not found.', 404);
  if (order.status !== 'Pending') return err('Payment already submitted for this order.', 409);
  db.prepare(`UPDATE orders SET status = 'Payment Pending' WHERE id = ?`).run(order.id);
  return json({ ok: true, status: 'Payment Pending' });
}
