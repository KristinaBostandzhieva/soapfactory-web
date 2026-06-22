import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-insecure-change-me');

export const SESSION_COOKIE = 'sf_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload extends JWTPayload {
  sub: string;
  email: string;
  role: string;
  name?: string | null;
}

export async function createToken(p: { sub: string; email: string; role: string; name?: string | null }) {
  return new SignJWT({ email: p.email, role: p.role, name: p.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
