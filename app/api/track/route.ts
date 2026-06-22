import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const VID_COOKIE = 'sf_vid';
const ONE_YEAR = 60 * 60 * 24 * 365;

// Records an anonymous page view. Called from the client only after the visitor
// has accepted cookies. No personal data — just path, referrer and an anonymous
// visitor id (random, first-party) so we can count unique visitors.
export async function POST(req: Request) {
  try {
    const { path, referrer, utmSource, utmMedium, utmCampaign } = await req.json().catch(() => ({}));
    if (!path || typeof path !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const clip = (v: unknown) => (v ? String(v).slice(0, 120) : null);
    // Don't track admin or API paths.
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const jar = await cookies();
    let vid = jar.get(VID_COOKIE)?.value;
    const res = NextResponse.json({ ok: true });
    if (!vid) {
      vid = crypto.randomUUID();
      res.cookies.set(VID_COOKIE, vid, { maxAge: ONE_YEAR, httpOnly: true, sameSite: 'lax', path: '/' });
    }

    await prisma.pageView.create({
      data: {
        path: path.slice(0, 300),
        referrer: referrer ? String(referrer).slice(0, 300) : null,
        sessionId: vid,
        utmSource: clip(utmSource),
        utmMedium: clip(utmMedium),
        utmCampaign: clip(utmCampaign),
      },
    });

    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
