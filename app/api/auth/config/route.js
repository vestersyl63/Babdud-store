import { json } from '@/lib/util.mjs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return json({
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
}
