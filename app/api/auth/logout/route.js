import { db } from '@/lib/db.mjs';
import { clearCookie, CUSTOMER_COOKIE } from '@/lib/auth.mjs';
import { json } from '@/lib/util.mjs';

export async function POST(req) {
  const token = req.cookies?.get(CUSTOMER_COOKIE)?.value;
  if (token) db.prepare(`DELETE FROM sessions WHERE token = ? AND kind = 'customer'`).run(token);
  return json({ ok: true }, 200, { headers: { 'Set-Cookie': clearCookie(CUSTOMER_COOKIE) } });
}
