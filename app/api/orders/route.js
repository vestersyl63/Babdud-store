import { db, customerSession, getSetting } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export async function GET(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in first.', 401);
  const orders = db
    .prepare(
      `SELECT o.*, (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC, o.id DESC`
    )
    .all(user.id);
  return json({ orders });
}

export async function POST(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in to place an order.', 401);
  let body = {};
  try {
    body = await req.json();
  } catch {}

  const items = db
    .prepare(
      `SELECT ci.product_id, ci.qty, p.name, p.price, p.stock FROM cart_items ci
       JOIN products p ON p.id = ci.product_id WHERE ci.owner = ?`
    )
    .all(`u${user.id}`);
  if (!items.length) return err('Your cart is empty.', 400);
  for (const it of items) {
    if (it.stock < it.qty) return err(`Not enough stock for “${it.name}”.`, 409);
  }

  let address = null;
  if (body.address_id) {
    address = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(body.address_id, user.id);
  } else if (body.address?.line1) {
    const info = db
      .prepare('INSERT INTO addresses (user_id, recipient, phone, line1, city, state, notes) VALUES (?,?,?,?,?,?,?)')
      .run(
        user.id,
        body.address.recipient || user.username,
        body.address.phone || user.phone,
        body.address.line1,
        body.address.city || '',
        body.address.state || '',
        body.address.notes || ''
      );
    address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(info.lastInsertRowid);
  } else {
    address = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC LIMIT 1').get(user.id);
  }
  if (!address) return err('Add a delivery address to continue.', 400);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = Number(getSetting('delivery_fee', '0')) || 0;
  const total = subtotal + deliveryFee;
  const orderNo =
    'BD-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10);

  const tx = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO orders (order_no, user_id, customer_name, address, subtotal, delivery_fee, total, status)
         VALUES (?,?,?,?,?,?,?, 'Pending')`
      )
      .run(orderNo, user.id, user.username, JSON.stringify(address), subtotal, deliveryFee, total);
    const orderId = info.lastInsertRowid;
    const insItem = db.prepare('INSERT INTO order_items (order_id, product_id, title, price, qty) VALUES (?,?,?,?,?)');
    for (const it of items) {
      insItem.run(orderId, it.product_id, it.name, it.price, it.qty);
      db.prepare('UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?').run(it.qty, it.qty, it.product_id);
    }
    db.prepare('DELETE FROM cart_items WHERE owner = ?').run(`u${user.id}`);
    return orderId;
  });
  const orderId = tx();

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  return json({ order }, 201);
}
