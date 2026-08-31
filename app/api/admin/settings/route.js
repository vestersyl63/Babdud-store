import { db, adminSession, getSetting, setSetting, allSettings } from '@/lib/db.mjs';
import { verifyPassword, hashPassword, passwordIssue } from '@/lib/auth.mjs';
import { json, err } from '@/lib/util.mjs';

export async function GET(req) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const s = allSettings();
  delete s.admin_password_hash;
  return json({ settings: s });
}

export async function PUT(req) {
  if (!adminSession(req)) return err('Admin only.', 401);
  const body = await req.json();

  if (body.current_password !== undefined) {
    const hash = getSetting('admin_password_hash');
    if (!verifyPassword(body.current_password, hash)) return err('Current password is incorrect.', 403);
    const issue = passwordIssue(body.new_password);
    if (issue) return err(issue);
    setSetting('admin_password_hash', hashPassword(body.new_password));
    return json({ ok: true, changed: 'password' });
  }

  const keys = ['bank_name', 'bank_account_name', 'bank_account_number', 'payment_instructions', 'delivery_fee', 'store_announcement'];
  for (const k of keys) {
    if (body[k] !== undefined) setSetting(k, body[k]);
  }
  return json({ ok: true });
}
