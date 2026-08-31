import { db } from '@/lib/db.mjs';
import { verifyPassword, newToken, sessionCookie, CUSTOMER_COOKIE } from '@/lib/auth.mjs';
import { json, err } from '@/lib/util.mjs';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return err('Invalid request body');
  }
  const phone = String(body.phone || '').replace(/[\s-]/g, '');
  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!user || user.provider === 'google' || !verifyPassword(body.password || '', user.password_hash)) {
    return err('Incorrect phone number or password.', 401);
  }
  if (user.status !== 'active') return err('This account is disabled.', 403);

  const token = newToken();
  db.prepare(`INSERT INTO sessions (token, user_id, kind) VALUES (?,?, 'customer')`).run(token, user.id);
  const safe = { id: user.id, phone: user.phone, username: user.username, avatar: user.avatar, provider: user.provider };
  return json({ user: safe }, 200, { headers: { 'Set-Cookie': sessionCookie(CUSTOMER_COOKIE, token) } });
}
