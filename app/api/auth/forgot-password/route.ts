import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { normalizeEmail } from '@/lib/email-normalize';
import { getClientIp } from '@/lib/signup-throttle';
import { verifyTurnstile } from '@/lib/turnstile';

// ── Strict throttle (password reset is a prime email-spam target) ──────
const MIN_INTERVAL_MS = 15 * 60 * 1000;  // ≥ 15 min between reset emails to one inbox
const MAX_PER_DAY_EMAIL = 5;             // ≤ 5 reset emails per inbox per 24h
const MAX_PER_HOUR_IP = 5;               // ≤ 5 reset requests per IP per hour
const PURGE_MS = 24 * 60 * 60 * 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Identical response for every case — never reveals whether the email exists,
// whether it's registered, or whether the request was rate-limited.
const OK = () => NextResponse.json({ ok: true });

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = String(body?.email || '');
    const ip = getClientIp(req);

    // Bot check first — before any DB work. Independent of the email, so it
    // leaks nothing about whether the address is registered.
    if (!(await verifyTurnstile(body?.turnstileToken, ip))) {
      return NextResponse.json({ error: 'Потвърждението, че не си робот, е невалидно. Опитай отново.' }, { status: 400 });
    }

    // Even invalid input returns the same OK — no hints.
    if (!EMAIL_RE.test(rawEmail.trim())) return OK();

    const email = normalizeEmail(rawEmail);
    const now = Date.now();

    // Log the attempt first, so the rate limit is enforced regardless of whether
    // the email exists (and so timing/behaviour don't differ for real users).
    await prisma.passwordResetRequest.create({ data: { email, ip, sent: false } });
    // Opportunistic cleanup of old rows.
    await prisma.passwordResetRequest.deleteMany({ where: { createdAt: { lt: new Date(now - PURGE_MS) } } }).catch(() => {});

    // ── Rate-limit checks (all applied before any user lookup) ──
    const ipCount = await prisma.passwordResetRequest.count({
      where: { ip, createdAt: { gte: new Date(now - 60 * 60 * 1000) } },
    });
    const sentRecently = await prisma.passwordResetRequest.count({
      where: { email, sent: true, createdAt: { gte: new Date(now - MIN_INTERVAL_MS) } },
    });
    const sentToday = await prisma.passwordResetRequest.count({
      where: { email, sent: true, createdAt: { gte: new Date(now - PURGE_MS) } },
    });

    const throttled = ipCount > MAX_PER_HOUR_IP || sentRecently > 0 || sentToday >= MAX_PER_DAY_EMAIL;
    if (throttled) return OK();

    const user = await prisma.user.findUnique({ where: { email } });
    // No account → still return OK (no enumeration). Nothing to send.
    if (!user) return OK();

    // Expire any existing unused tokens for this user.
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { expiresAt: new Date(0) },
    });

    const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(now + 60 * 60 * 1000) }, // 1 hour
    });

    await sendPasswordResetEmail(user.email, user.name ?? undefined, token);

    // Mark the most recent attempt for this email as an actual send (for the interval/day caps).
    const last = await prisma.passwordResetRequest.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });
    if (last) await prisma.passwordResetRequest.update({ where: { id: last.id }, data: { sent: true } });

    return OK();
  } catch (err) {
    console.error('[forgot-password]', err);
    // Even on error, don't leak — return the same OK shape.
    return OK();
  }
}
