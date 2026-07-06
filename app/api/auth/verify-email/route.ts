import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';
import { normalizeEmail } from '@/lib/email-normalize';

const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = normalizeEmail(String(body.email || ''));
  const code = String(body.code || '').trim();

  const pending = await prisma.pendingSignup.findUnique({ where: { email } });
  if (!pending) {
    return NextResponse.json({ error: 'Няма чакаща регистрация за този имейл. Регистрирай се отново.' }, { status: 404 });
  }

  if (pending.expiresAt < new Date()) {
    await prisma.pendingSignup.delete({ where: { email } }).catch(() => {});
    return NextResponse.json({ error: 'Кодът е изтекъл. Регистрирай се отново.' }, { status: 410 });
  }

  if (pending.attempts >= MAX_ATTEMPTS) {
    await prisma.pendingSignup.delete({ where: { email } }).catch(() => {});
    return NextResponse.json({ error: 'Твърде много опити. Регистрирай се отново.' }, { status: 429 });
  }

  if (code !== pending.code) {
    await prisma.pendingSignup.update({ where: { email }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ error: 'Грешен код. Опитай отново.' }, { status: 400 });
  }

  // Guard against a race where the email got registered in the meantime.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.pendingSignup.delete({ where: { email } }).catch(() => {});
    return NextResponse.json({ error: 'Този имейл вече е регистриран.' }, { status: 409 });
  }

  // Correct code → the account becomes real.
  const user = await prisma.user.create({
    data: {
      email: pending.email,
      name: pending.name,
      passwordHash: pending.passwordHash,
      hashType: 'bcrypt',
      role: 'user',
    },
  });
  await prisma.pendingSignup.delete({ where: { email } }).catch(() => {});

  await createSession(user);

  return NextResponse.json({ ok: true, user: { email: user.email, name: user.name, role: user.role } });
}
