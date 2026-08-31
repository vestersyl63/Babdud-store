import { db, adminSession } from '@/lib/db.mjs';
import { json, err } from '@/lib/util.mjs';

export async function DELETE(req, { params }) {
  if (!adminSession(req)) return err('Admin only.', 401);
  if (params.kind === 'review') {
    db.prepare('DELETE FROM reviews WHERE id = ?').run(params.id);
  } else if (params.kind === 'comment') {
    db.prepare('DELETE FROM comments WHERE id = ?').run(params.id);
  } else {
    return err('Unknown type.', 404);
  }
  return json({ ok: true });
}
