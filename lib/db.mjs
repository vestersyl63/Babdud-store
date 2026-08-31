import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { hashPassword } from './auth.mjs';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function open() {
  const db = new DatabaseSync(path.join(DATA_DIR, 'store.db'));
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE,
  email TEXT,
  google_id TEXT,
  username TEXT,
  password_hash TEXT,
  avatar TEXT,
  provider TEXT DEFAULT 'phone',
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient TEXT, phone TEXT, line1 TEXT, city TEXT, state TEXT, notes TEXT,
  is_default INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'customer',
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  blurb TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  previous_price INTEGER,
  stock INTEGER NOT NULL DEFAULT 0,
  sold INTEGER NOT NULL DEFAULT 0,
  specs TEXT,
  variations TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS cart_items (
  owner TEXT NOT NULL,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (owner, product_id)
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT,
  address TEXT,
  subtotal INTEGER NOT NULL DEFAULT 0,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'bank_transfer',
  status TEXT DEFAULT 'Pending',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  title TEXT, price INTEGER, qty INTEGER
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  body TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (product_id, user_id)
);
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS likes (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, product_id)
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_comments_product ON comments(product_id);
`);

  // ---- Seed defaults (idempotent) ----
  const get = db.prepare('SELECT value FROM settings WHERE key = ?');
  const set = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING'
  );
  if (!get.get('admin_password_hash')) {
    set.run('admin_password_hash', hashPassword('babdud101'));
  }
  set.run('bank_name', '');
  set.run('bank_account_name', '');
  set.run('bank_account_number', '');
  set.run('payment_instructions', '');
  set.run('delivery_fee', '0');
  set.run('store_announcement', '');

  const catCount = db.prepare('SELECT COUNT(*) c FROM categories').get().c;
  if (catCount === 0) {
    const ins = db.prepare('INSERT INTO categories (name, slug, blurb) VALUES (?,?,?)');
    [
      ['Adire Fabric', 'adire-fabric', 'Hand-dyed indigo adire, yardage and wrappers'],
      ['Ready to Wear', 'ready-to-wear', 'Egbankaye, bubu, caftan and styles'],
      ['Accessories', 'accessories', 'Head ties, caps and finishing touches'],
    ].forEach((c) => ins.run(...c));
  }
  return db;
}

const g = globalThis;
export const db = g.__bdb ?? (g.__bdb = open());

// ---------- helpers ----------
export function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}
export function setSetting(key, value) {
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, String(value ?? ''));
}
export function allSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function productWithImages(p) {
  if (!p) return null;
  const images = db
    .prepare('SELECT id, url, position FROM product_images WHERE product_id = ? ORDER BY position, id')
    .all(p.id);
  const cat = p.category_id
    ? db.prepare('SELECT name, slug FROM categories WHERE id = ?').get(p.category_id)
    : null;
  const agg = db
    .prepare('SELECT COUNT(*) c, COALESCE(AVG(rating),0) a FROM reviews WHERE product_id = ?')
    .get(p.id);
  return { ...p, images, category: cat, rating: round1(agg.a), review_count: agg.c };
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

export function listProducts({ q, categorySlug, sort, limit, activeOnly = true } = {}) {
  let sql = 'SELECT p.* FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE 1=1';
  const args = [];
  if (activeOnly) sql += ' AND p.active = 1';
  if (categorySlug) {
    sql += ' AND c.slug = ?';
    args.push(categorySlug);
  }
  if (q) {
    sql +=
      ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ? OR p.specs LIKE ?)';
    const like = `%${q}%`;
    args.push(like, like, like, like);
  }
  switch (sort) {
    case 'price_asc':
      sql += ' ORDER BY p.price ASC';
      break;
    case 'price_desc':
      sql += ' ORDER BY p.price DESC';
      break;
    case 'rating':
      sql +=
        ' ORDER BY (SELECT COALESCE(AVG(rating),0) FROM reviews r WHERE r.product_id = p.id) DESC, p.created_at DESC';
      break;
    case 'bestselling':
      sql += ' ORDER BY p.sold DESC, p.created_at DESC';
      break;
    default:
      sql += ' ORDER BY p.created_at DESC, p.id DESC';
  }
  if (limit) {
    sql += ' LIMIT ?';
    args.push(limit);
  }
  return db.prepare(sql).all(...args).map(productWithImages);
}

export function customerSession(req) {
  const token = req.cookies?.get('bc_session')?.value;
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.phone, u.username, u.avatar, u.provider, u.status, s.token FROM sessions s
       JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.kind = 'customer'`
    )
    .get(token);
  if (!row || row.status !== 'active') return null;
  return row;
}

export function adminSession(req) {
  const token = req.cookies?.get('bc_admin')?.value;
  if (!token) return null;
  const row = db
    .prepare(`SELECT token FROM sessions WHERE token = ? AND kind = 'admin'`)
    .get(token);
  return row || null;
}
