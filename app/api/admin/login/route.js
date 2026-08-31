import { db, getSetting } from '@/lib/db.mjs';
import { verifyPassword, newToken, sessionCookie, ADMIN_COOKIE } from '@/lib/auth.mjs';
import { json, err } from '@/lib/util.mjs';

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  const hash = getSetting('admin_password_hash');
  if (!password || !verifyPassword(password, hash)) return err('Incorrect admin password.', 401);
  const token = newToken();
  db.prepare(`INSERT INTO sessions (token, kind) VALUES (?, 'admin')`).run(token);
  return json({ ok: true }, 200, { headers: { 'Set-Cookie': sessionCookie(ADMIN_COOKIE, token) } });
}
