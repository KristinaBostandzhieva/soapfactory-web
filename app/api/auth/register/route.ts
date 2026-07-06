import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { sendVerificationCodeEmail, sendAccountExistsEmail } from '@/lib/email';
import { normalizeEmail } from '@/lib/email-normalize';
import { verifyTurnstile } from '@/lib/turnstile';
import {
  CODE_TTL_MS, LOCKOUT_MESSAGE, sixDigitCode, getClientIp,
  gateCodeIssue, nextResendDelaySec, ipUnderLimit, recordIpSend,
} from '@/lib/signup-throttle';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const rawEmail = String(body.email || '').toLowerCase().trim();
  const password = String(body.password || '');
  const name = String(body.name || '').trim();

  if (!name) return NextResponse.json({ error: 'Моля, въведи име и фамилия.' }, { status: 400 });
  if (!EMAIL_RE.test(rawEmail)) return NextResponse.json({ error: 'Невалиден имейл адрес.' }, { status: 400 });

  // Bot check — verified server-side; a captured/replayed token fails here.
  if (!(await verifyTurnstile(body.turnstileToken, getClientIp(req)))) {
    return NextResponse.json({ error: 'Потвърждението, че не си робот, е невалидно. Опитай отново.' }, { status: 400 });
  }

  if (password.length < 6) return NextResponse.json({ error: 'Паролата трябва да е поне 6 символа.' }, { status: 400 });

  // Collapse dot / +tag aliases (e.g. Gmail) so they can't dodge the per-email limit.
  const email = normalizeEmail(rawEmail);

  // Does an account already exist? Check the canonical form and the raw address
  // (legacy/imported users may be stored non-canonically).
  const existing =
    (await prisma.user.findUnique({ where: { email } })) ||
    (rawEmail !== email ? await prisma.user.findUnique({ where: { email: rawEmail } }) : null);

  // ── From here the code path is IDENTICAL whether or not the email exists, so
  // the response (status, body, timing) never reveals which emails are customers.
  // For an existing account we run the same work but send an "account exists"
  // notice instead of a signup code, and never create/confirm a user for it.

  // Per-email escalating cooldown (60s → 120s → 6h lock) — same for both cases.
  const pending = await prisma.pendingSignup.findUnique({ where: { email } });
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
  // Always hash (even for existing accounts) so timing doesn't leak the branch.
  const passwordHash = await hashPassword(password);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);
  const resendCount = gate.action === 'resend' ? gate.resendCount : 0;

  // Track a pending row in BOTH cases so repeated attempts hit the same cooldown
  // (an existing email can't be told apart from a new one by hammering it).
  await prisma.pendingSignup.upsert({
    where: { email },
    update: { name, passwordHash, code, expiresAt, attempts: 0, resendCount, lastSentAt: new Date(), lockedUntil: null },
    create: { email, name, passwordHash, code, expiresAt },
  });

  await recordIpSend(ip);
  if (existing) {
    // Real account already exists → tell the owner (who controls the inbox),
    // not the requester. The code stored above is never delivered or usable.
    await sendAccountExistsEmail(existing.email, existing.name);
  } else {
    await sendVerificationCodeEmail(email, name, code);
  }

  // Identical response in both cases. No user, no session yet.
  return NextResponse.json({ ok: true, pending: true, email, retryAfter: nextResendDelaySec(resendCount) });
}
