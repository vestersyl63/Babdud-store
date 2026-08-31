import { newToken } from '@/lib/auth.mjs';
import { err } from '@/lib/util.mjs';

export async function GET(req) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !secret) return err('Google Sign-In is not configured on this server.', 501);

  const origin = req.nextUrl?.origin || new URL(req.url).origin;
  const state = newToken();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return Response.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    302,
    { headers: { 'Set-Cookie': `bc_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600` } }
  );
}
