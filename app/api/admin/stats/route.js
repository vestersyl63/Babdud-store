import { db, adminSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export async function GET(req) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const one = (sql) => db.prepare(sql).get().v;
  const stats = {
    products: one('SELECT COUNT(*) v FROM products'),
    orders: one('SELECT COUNT(*) v FROM orders'),
    pending: one(`SELECT COUNT(*) v FROM orders WHERE status IN ('Pending','Payment Pending')`),
    completed: one(`SELECT COUNT(*) v FROM orders WHERE status = 'Delivered'`),
    customers: one(`SELECT COUNT(*) v FROM users WHERE provider IS NOT NULL`),
    revenue: one(
      `SELECT COALESCE(SUM(total),0) v FROM orders WHERE status IN ('Payment Confirmed','Processing','Shipped','Delivered')`
    ),
  };
  const recent = db
    .prepare(
      `SELECT o.id, o.order_no, o.total, o.status, o.created_at, u.username, u.phone
       FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC, o.id DESC LIMIT 8`
    )
    .all();
  const lowStock = db
    .prepare('SELECT id, name, stock, slug FROM products WHERE active = 1 AND stock <= 5 ORDER BY stock ASC LIMIT 8')
    .all();
  return json({ stats, recent, lowStock });
}
