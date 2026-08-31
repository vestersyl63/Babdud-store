import fs from 'fs';
import path from 'path';
import { db, customerSession } from '@/lib/db.mjs';
import { verifyPassword, hashPassword, passwordIssue } from '@/lib/auth.mjs';
import { json, err } from '@/lib/util.mjs';

export async function PATCH(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in first.', 401);
  const body = await req.json();

  if (body.password !== undefined) {
    const full = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id);
    if (full.password_hash && !verifyPassword(body.current_password || '', full.password_hash))
      return err('Current password is incorrect.', 403);
    const issue = passwordIssue(body.password);
    if (issue) return err(issue);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(body.password), user.id);
    return json({ ok: true });
  }

  if (body.username !== undefined) {
    const name = String(body.username).trim();
    if (!name || name.length > 40) return err('Username looks invalid.');
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(name, user.id);
  }
  if (body.avatar !== undefined) {
    const old = db.prepare('SELECT avatar FROM users WHERE id = ?').get(user.id).avatar;
    db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(body.avatar || null, user.id);
    if (old && old.startsWith('/uploads/')) {
      try {
        fs.unlinkSync(path.join(process.cwd(), 'public', old));
      } catch {}
    }
  }
  if (body.phone !== undefined) {
    const phone = String(body.phone).replace(/[\s-]/g, '');
    if (!/^\+?\d{10,15}$/.test(phone)) return err('Enter a valid phone number.');
    const dup = db.prepare('SELECT id FROM users WHERE phone = ? AND id != ?').get(phone, user.id);
    if (dup) return err('That phone number is already in use.', 409);
    db.prepare('UPDATE users SET phone = ? WHERE id = ?').run(phone, user.id);
  }
  const fresh = db.prepare('SELECT id, phone, username, avatar, provider FROM users WHERE id = ?').get(user.id);
  return json({ user: fresh });
}

export async function GET(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in first.', 401);
  const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id').all(user.id);
  return json({ addresses });
}

export async function POST(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in first.', 401);
  const a = await req.json();
  if (!a.line1?.trim()) return err('Address line is required.');
  db.prepare('INSERT INTO addresses (user_id, recipient, phone, line1, city, state, notes, is_default) VALUES (?,?,?,?,?,?,?,1)')
    .run(user.id, a.recipient || user.username, a.phone || user.phone, a.line1, a.city || '', a.state || '', a.notes || '');
  db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ? AND id != last_insert_rowid()').run(user.id);
  return json({ ok: true }, 201);
}

export async function PUT(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in first.', 401);
  const a = await req.json();
  if (!a.id) return err('Address id required.');
  const own = db.prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ?').get(a.id, user.id);
  if (!own) return err('Not found.', 404);
  db.prepare('UPDATE addresses SET recipient=?, phone=?, line1=?, city=?, state=?, notes=? WHERE id=?')
    .run(a.recipient || '', a.phone || '', a.line1 || '', a.city || '', a.state || '', a.notes || '', a.id);
  return json({ ok: true });
}

export async function DELETE(req) {
  const user = customerSession(req);
  if (!user) return err('Sign in first.', 401);
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(id, user.id);
  return json({ ok: true });
}
