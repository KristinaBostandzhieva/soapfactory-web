import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Не си влязъл.' }, { status: 401 });

    const { current, next } = await req.json();
    if (!current || !next || next.length < 6) {
      return NextResponse.json({ error: 'Моля попълни всички полета (мин. 6 символа).' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'Потребителят не е намерен.' }, { status: 404 });

    const valid = await verifyPassword(current, dbUser.passwordHash, dbUser.hashType);
    if (!valid) return NextResponse.json({ error: 'Текущата парола е грешна.' }, { status: 400 });

    const hash = await bcrypt.hash(next, 12);
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { passwordHash: hash, hashType: 'bcrypt' },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[change-password]', err);
    return NextResponse.json({ error: 'Грешка на сървъра.' }, { status: 500 });
  }
}
