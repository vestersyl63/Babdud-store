import { db } from '@/lib/db.mjs';
import { hashPassword, passwordIssue, newToken, sessionCookie, CUSTOMER_COOKIE } from '@/lib/auth.mjs';
import { json, err } from '@/lib/util.mjs';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return err('Invalid request body');
  }
  const phone = String(body.phone || '').replace(/[\s-]/g, '');
  const { password, username } = body;

  if (!/^\+?\d{10,15}$/.test(phone)) return err('Enter a valid phone number.');
  const issue = passwordIssue(password);
  if (issue) return err(issue);

  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existing) return err('An account with this phone number already exists.', 409);

  const info = db
    .prepare(
      `INSERT INTO users (phone, username, password_hash, provider) VALUES (?,?,?,'phone')`
    )
    .run(phone, username?.trim() || `Customer${phone.slice(-4)}`, hashPassword(password));
  const userId = info.lastInsertRowid;

  if (body.address?.line1) {
    db.prepare(
      'INSERT INTO addresses (user_id, recipient, phone, line1, city, state, notes) VALUES (?,?,?,?,?,?,?)'
    ).run(
      userId,
      body.address.recipient || username || '',
      body.address.phone || phone,
      body.address.line1,
      body.address.city || '',
      body.address.state || '',
      body.address.notes || ''
    );
  }

  const token = newToken();
  db.prepare(`INSERT INTO sessions (token, user_id, kind) VALUES (?, ?, 'customer')`).run(token, userId);

  const user = db.prepare('SELECT id, phone, username, avatar, provider FROM users WHERE id = ?').get(userId);
  return json({ user }, 201, { headers: { 'Set-Cookie': sessionCookie(CUSTOMER_COOKIE, token) } });
}
