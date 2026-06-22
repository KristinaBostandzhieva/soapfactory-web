import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/password';
import { createSession } from '@/lib/session';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').toLowerCase().trim();
  const password = String(body.password || '');

  if (!email || !password) {
    return NextResponse.json({ error: 'Въведи имейл и парола.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // same response whether user missing or wrong password (avoid user enumeration)
  if (!user) return NextResponse.json({ error: 'Грешен имейл или парола.' }, { status: 401 });

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
