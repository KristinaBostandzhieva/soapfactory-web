import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { createToken, verifyToken, SESSION_COOKIE, SESSION_MAX_AGE } from './auth';

// Lightweight session (from the cookie JWT) — no DB hit
export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Full user record for the logged-in session
export async function getCurrentUser() {
  const s = await getSession();
  if (!s?.sub) return null;
  return prisma.user.findUnique({
    where: { id: s.sub },
    select: {
      id: true, email: true, name: true, role: true,
      phone: true, address: true, city: true, postcode: true, country: true,
    },
  });
}

export async function requireAdmin() {
  const s = await getSession();
  return s?.role === 'admin' ? s : null;
}

// Sign a session token for `user` and set it as the session cookie.
export async function createSession(user: { id: string; email: string; role: string; name?: string | null }) {
  const token = await createToken({ sub: user.id, email: user.email, role: user.role, name: user.name });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}
