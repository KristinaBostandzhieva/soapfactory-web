import { prisma } from './prisma';

// ── Tunables ──────────────────────────────────────────────────────────
export const CODE_TTL_MS = 5 * 60 * 1000;         // confirmation code validity (5 min)
const RESEND_DELAYS_MS = [60_000, 120_000];       // gap before resend #1 (60s), #2 (120s)
const LOCKOUT_MS = 6 * 60 * 60 * 1000;            // after that → 6h lockout
const IP_WINDOW_MS = 60 * 60 * 1000;              // per-IP window
const IP_MAX_SENDS = 5;                           // max codes emailed per IP per window

// Bulgarian message shown when the escalation trips a long lockout / IP flood.
export const LOCKOUT_MESSAGE = 'Неуспешно регистриране, пробвайте отново по-късно.';

export function sixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

type Pending = {
  email: string;
  resendCount: number;
  lastSentAt: Date;
  lockedUntil: Date | null;
  expiresAt: Date;
};

export type CodeGate =
  | { action: 'fresh' }                         // new signup / expired / lockout elapsed → reset counters
  | { action: 'resend'; resendCount: number }   // active pending → escalate
  | { action: 'block'; lockout: true }          // 6h lockout in effect (or just tripped)
  | { action: 'block'; retryAfter: number };    // must wait `retryAfter` seconds

/**
 * Per-email escalating cooldown. Given the existing pending row (or null),
 * decides whether a fresh code may be issued now. Trips the 6h lockout in the
 * DB when the escalation is exhausted.
 */
export async function gateCodeIssue(pending: Pending | null, now = Date.now()): Promise<CodeGate> {
  if (!pending) return { action: 'fresh' };

  if (pending.lockedUntil && pending.lockedUntil.getTime() > now) {
    return { action: 'block', lockout: true };
  }
  // Lockout elapsed, or the code expired → start over cleanly.
  if ((pending.lockedUntil && pending.lockedUntil.getTime() <= now) || pending.expiresAt.getTime() <= now) {
    return { action: 'fresh' };
  }
  // Active pending → this is a resend; apply the escalating gap.
  if (pending.resendCount >= RESEND_DELAYS_MS.length) {
    await prisma.pendingSignup.update({
      where: { email: pending.email },
      data: { lockedUntil: new Date(now + LOCKOUT_MS) },
    }).catch(() => {});
    return { action: 'block', lockout: true };
  }
  const gap = RESEND_DELAYS_MS[pending.resendCount];
  const elapsed = now - pending.lastSentAt.getTime();
  if (elapsed < gap) return { action: 'block', retryAfter: Math.ceil((gap - elapsed) / 1000) };

  return { action: 'resend', resendCount: pending.resendCount + 1 };
}

/** Seconds the client must wait before the *next* resend, or null if the next attempt would lock. */
export function nextResendDelaySec(resendCountAfter: number): number | null {
  if (resendCountAfter >= RESEND_DELAYS_MS.length) return null;
  return Math.round(RESEND_DELAYS_MS[resendCountAfter] / 1000);
}

/** True if this IP is still under its per-hour code-send cap. Opportunistically purges old rows. */
export async function ipUnderLimit(ip: string, now = Date.now()): Promise<boolean> {
  await prisma.signupIpLog.deleteMany({ where: { createdAt: { lt: new Date(now - LOCKOUT_MS) } } }).catch(() => {});
  const count = await prisma.signupIpLog.count({
    where: { ip, createdAt: { gte: new Date(now - IP_WINDOW_MS) } },
  });
  return count < IP_MAX_SENDS;
}

export async function recordIpSend(ip: string): Promise<void> {
  await prisma.signupIpLog.create({ data: { ip } }).catch(() => {});
}
