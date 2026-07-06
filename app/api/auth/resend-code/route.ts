import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationCodeEmail } from '@/lib/email';
import { normalizeEmail } from '@/lib/email-normalize';
import {
  CODE_TTL_MS, LOCKOUT_MESSAGE, sixDigitCode, getClientIp,
  gateCodeIssue, nextResendDelaySec, ipUnderLimit, recordIpSend,
} from '@/lib/signup-throttle';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = normalizeEmail(String(body.email || ''));

  const pending = await prisma.pendingSignup.findUnique({ where: { email } });
  if (!pending) {
    return NextResponse.json({ error: 'Няма чакаща регистрация за този имейл. Регистрирай се отново.' }, { status: 404 });
  }

  // Per-email escalating cooldown (60s → 120s → 6h lock).
  const gate = await gateCodeIssue(pending);
  if (gate.action === 'block') {
    if ('lockout' in gate) return NextResponse.json({ error: LOCKOUT_MESSAGE }, { status: 429 });
    return NextResponse.json(
      { error: `Изчакай още ${gate.retryAfter} сек., преди да поискаш нов код.`, retryAfter: gate.retryAfter },
      { status: 429 },
    );
  }

  // Per-IP anti-flood cap.
  const ip = getClientIp(req);
  if (!(await ipUnderLimit(ip))) {
    return NextResponse.json({ error: LOCKOUT_MESSAGE }, { status: 429 });
  }

  const code = sixDigitCode();
  const resendCount = gate.action === 'resend' ? gate.resendCount : 0;

  await prisma.pendingSignup.update({
    where: { email },
    data: { code, expiresAt: new Date(Date.now() + CODE_TTL_MS), attempts: 0, resendCount, lastSentAt: new Date(), lockedUntil: null },
  });

  await recordIpSend(ip);
  await sendVerificationCodeEmail(email, pending.name, code);

  return NextResponse.json({ ok: true, retryAfter: nextResendDelaySec(resendCount) });
}
