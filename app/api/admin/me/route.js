import { adminSession } from '@/lib/db.mjs';
import { json } from '@/lib/util.mjs';

export async function GET(req) {
  return json({ admin: Boolean(adminSession(req)) });
}
