import { customerSession } from '@/lib/db.mjs';
import { json } from '@/lib/util.mjs';

export async function GET(req) {
  const user = customerSession(req);
  return json({ user });
}
