/**
 * Canonicalise an email address so that provider-level aliases that all land in
 * the SAME inbox collapse to one string. Used to key the signup flow so someone
 * can't bypass the per-email rate limit with dot / +tag variants.
 *
 *  - lowercase + trim
 *  - strip "+tag" sub-addressing (same mailbox on all major providers)
 *  - Gmail: dots in the local part are ignored, and googlemail.com == gmail.com
 *
 * The canonical form is still deliverable (Gmail accepts the dot-less address),
 * so we can safely send the code to it.
 */
export function normalizeEmail(raw: string): string {
  const email = String(raw || '').trim().toLowerCase();
  const at = email.lastIndexOf('@');
  if (at === -1) return email;

  let local = email.slice(0, at);
  let domain = email.slice(at + 1);

  // Sub-addressing: "user+anything" → "user"
  const plus = local.indexOf('+');
  if (plus !== -1) local = local.slice(0, plus);

  // Gmail ignores dots and treats googlemail as gmail.
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, '');
    domain = 'gmail.com';
  }

  return `${local}@${domain}`;
}
