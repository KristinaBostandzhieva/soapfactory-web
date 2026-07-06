import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// In production, AUTH_SECRET MUST be set — otherwise session JWTs would be
// signed with a public, hardcoded key and anyone could forge an admin session.
// Fail fast rather than boot with a forgeable secret.
if (process.env.NODE_ENV === 'production' && !process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET is not set. Refusing to start with an insecure default session secret in production.');
}

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-insecure-change-me');

export const SESSION_COOKIE = 'sf_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload extends JWTPayload {
  sub: string;
  email: string;
  role: string;
  name?: string | null;
  sv?: number; // session version — must match the user's current sessionVersion
}

export async function createToken(p: { sub: string; email: string; role: string; name?: string | null; sv?: number }) {
  return new SignJWT({ email: p.email, role: p.role, name: p.name, sv: p.sv ?? 0 })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    // Pin the algorithm — never accept anything but HS256 (defense-in-depth).
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
