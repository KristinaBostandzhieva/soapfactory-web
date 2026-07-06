import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/password';
import { createSession } from '@/lib/session';
import { normalizeEmail } from '@/lib/email-normalize';

// A real bcrypt hash (of a random string) used to burn ~the same CPU time when
// no user is found, so response timing doesn't reveal whether the account exists.
const DUMMY_HASH = '$2b$12$syKuz/qPBAn84dBcwAd.pOTmA80xHYfJqZPcshBZ5SNdQau9SipZG';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').toLowerCase().trim();
  const password = String(body.password || '');

  if (!email || !password) {
    return NextResponse.json({ error: 'Въведи имейл и парола.' }, { status: 400 });
  }

  // Try the address as typed first (keeps legacy/imported emails working), then
  // fall back to the canonical form so accounts created via the normalized
  // signup flow can log in with any dot / +tag variant.
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const canonical = normalizeEmail(email);
    if (canonical !== email) user = await prisma.user.findUnique({ where: { email: canonical } });
  }
  // same response whether user missing or wrong password (avoid user enumeration)
  if (!user) {
    // Burn comparable CPU so timing doesn't reveal that the account is missing.
    await verifyPassword(password, DUMMY_HASH, 'bcrypt');
    return NextResponse.json({ error: 'Грешен имейл или парола.' }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash, user.hashType);
  if (!ok) return NextResponse.json({ error: 'Грешен имейл или парола.' }, { status: 401 });

  // Lazy upgrade legacy WordPress hashes to bcrypt on first successful login
  if (user.hashType !== 'bcrypt') {
    const newHash = await hashPassword(password);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash, hashType: 'bcrypt' } });
  }

  await createSession(user);

  return NextResponse.json({ ok: true, user: { email: user.email, name: user.name, role: user.role } });
}
