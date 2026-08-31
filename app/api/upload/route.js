import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { customerSession, adminSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(req) {
  const admin = adminSession(req);
  const user = customerSession(req);
  const scope = new URL(req.url).searchParams.get('scope') || 'avatar';
  if (scope === 'product' && !admin) return err('Admin only.', 403);
  if (scope !== 'product' && !user && !admin) return err('Sign in first.', 401);

  let form;
  try {
    form = await req.formData();
  } catch {
    return err('Invalid upload payload.', 400);
  }
  const file = form.get('image') || form.get('file');
  if (!file || typeof file === 'string') return err('No image file provided.', 400);
  if (!ALLOWED[file.type]) return err('Only JPG, PNG, WEBP or GIF images are allowed.', 415);
  if (file.size > 8 * 1024 * 1024) return err('Image must be under 8 MB.', 413);

  const dir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ALLOWED[file.type]}`;
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, name), buf);

  return json({ url: `/uploads/${name}` }, 201);
}
