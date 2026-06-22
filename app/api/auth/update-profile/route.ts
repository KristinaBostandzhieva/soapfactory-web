import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Не си влязъл.' }, { status: 401 });

    const { name, phone, address, city, postcode } = await req.json();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name ? String(name).trim() : null,
        phone: phone ? String(phone).trim() : null,
        address: address ? String(address).trim() : null,
        city: city ? String(city).trim() : null,
        postcode: postcode ? String(postcode).trim() : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[update-profile]', err);
    return NextResponse.json({ error: 'Грешка на сървъра.' }, { status: 500 });
  }
}
