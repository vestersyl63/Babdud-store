import crypto from 'crypto';

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(pw), salt, 64).toString('hex');
  return `${salt}$${hash}`;
}

export function verifyPassword(pw, stored) {
  if (!stored || !stored.includes('$')) return false;
  const [salt, hash] = stored.split('$');
  const check = crypto.scryptSync(String(pw), salt, 64).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
  } catch {
    return false;
  }
}

export function passwordIssue(pw) {
  if (!pw || pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw))
    return 'Password must contain both letters and numbers.';
  return null;
}

export function newToken() {
  return crypto.randomBytes(24).toString('hex');
}

export function sessionCookie(name, value, opts = {}) {
  const parts = [`${name}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=2592000'];
  return parts.join('; ');
}

export function clearCookie(name) {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function cookieFrom(req, name) {
  return req.cookies?.get(name)?.value || null;
}

export const CUSTOMER_COOKIE = 'bc_session';
export const ADMIN_COOKIE = 'bc_admin';
