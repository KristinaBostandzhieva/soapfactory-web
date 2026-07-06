import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { createToken, verifyToken, SESSION_COOKIE, SESSION_MAX_AGE } from './auth';

// Lightweight session (from the cookie JWT) — no DB hit
export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Full user record for the logged-in session. Returns null if the token's
// session version no longer matches the user's (i.e. it was revoked by a
// password change/reset), or if the user no longer exists.
export async function getCurrentUser() {
  const s = await getSession();
  if (!s?.sub) return null;
  const user = await prisma.user.findUnique({
    where: { id: s.sub },
    select: {
      id: true, email: true, name: true, role: true,
      phone: true, address: true, city: true, postcode: true, country: true,
      sessionVersion: true,
    },
  });
  if (!user) return null;
  if ((s.sv ?? 0) !== user.sessionVersion) return null; // token revoked
  const { sessionVersion: _sv, ...rest } = user;
  return rest;
}

// DB-backed admin check — role AND session version are read fresh from the
// database, so a demoted admin (or a revoked token) loses access immediately
// rather than staying admin until the 30-day token expires.
export async function requireAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'admin' ? user : null;
}

// Sign a session token for `user` and set it as the session cookie.
export async function createSession(user: { id: string; email: string; role: string; name?: string | null; sessionVersion?: number }) {
  const token = await createToken({ sub: user.id, email: user.email, role: user.role, name: user.name, sv: user.sessionVersion ?? 0 });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}
