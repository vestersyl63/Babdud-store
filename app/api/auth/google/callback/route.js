import { db } from '@/lib/db.mjs';
import { newToken, sessionCookie, CUSTOMER_COOKIE, clearCookie } from '@/lib/auth.mjs';
import { err } from '@/lib/util.mjs';

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const savedState = req.cookies?.get('bc_oauth_state')?.value;
  const origin = url.origin;

  if (!code || !savedState || state !== savedState) return err('Google sign-in failed (state mismatch).', 400);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !secret) return err('Google Sign-In is not configured.', 501);

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: secret,
      redirect_uri: `${origin}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) return err('Could not complete Google sign-in.', 400);
  const tokens = await tokenRes.json();

  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userRes.ok) return err('Could not fetch Google profile.', 400);
  const profile = await userRes.json();
  if (!profile?.id) return err('Google profile missing identifier.', 400);

  let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id);
  if (!user && profile.email) {
    user = db.prepare('SELECT * FROM users WHERE email = ?').get(profile.email);
  }
  if (!user) {
    const info = db
      .prepare(
        `INSERT INTO users (email, google_id, username, avatar, provider) VALUES (?,?,?,?,'google')`
      )
      .run(profile.email || null, profile.id, profile.name || 'Google Customer', profile.picture || null);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  } else {
    db.prepare('UPDATE users SET google_id = COALESCE(?, google_id), avatar = COALESCE(avatar, ?) WHERE id = ?').run(
      profile.id,
      profile.picture,
      user.id
    );
  }
  if (user.status !== 'active') return err('This account is disabled.', 403);

  const token = newToken();
  db.prepare(`INSERT INTO sessions (token, user_id, kind) VALUES (?, ?, 'customer')`).run(token, user.id);

  return Response.redirect(`${origin}/account`, 302, {
    headers: {
      'Set-Cookie': [sessionCookie(CUSTOMER_COOKIE, token), clearCookie('bc_oauth_state')],
    },
  });
}
