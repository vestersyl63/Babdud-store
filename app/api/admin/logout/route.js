import { db } from '@/lib/db.mjs';
import { clearCookie, ADMIN_COOKIE } from '@/lib/auth.mjs';
import { json } from '@/lib/util.mjs';

export async function POST(req) {
  const token = req.cookies?.get(ADMIN_COOKIE)?.value;
  if (token) db.prepare(`DELETE FROM sessions WHERE token = ? AND kind = 'admin'`).run(token);
  return json({ ok: true }, 200, { headers: { 'Set-Cookie': clearCookie(ADMIN_COOKIE) } });
}
