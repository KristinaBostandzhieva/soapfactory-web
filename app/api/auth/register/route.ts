import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { createSession } from '@/lib/session';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').toLowerCase().trim();
  const password = String(body.password || '');
  const name = String(body.name || '').trim() || null;

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Невалиден имейл адрес.' }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: 'Паролата трябва да е поне 6 символа.' }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Този имейл вече е регистриран.' }, { status: 409 });

  const user = await prisma.user.create({
    data: { email, name, passwordHash: await hashPassword(password), hashType: 'bcrypt', role: 'user' },
  });

  await createSession(user);

  return NextResponse.json({ ok: true, user: { email: user.email, name: user.name, role: user.role } });
}
