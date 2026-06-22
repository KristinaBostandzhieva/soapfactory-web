// Works out a human-readable traffic source ("channel") from UTM tags (preferred,
// reliable for ads) or, failing that, the referring site.

const NAMES: Record<string, string> = {
  facebook: 'Facebook', fb: 'Facebook', meta: 'Facebook',
  instagram: 'Instagram', ig: 'Instagram',
  tiktok: 'TikTok',
  google: 'Google', youtube: 'YouTube',
  email: 'Имейл', newsletter: 'Бюлетин',
  twitter: 'X (Twitter)', x: 'X (Twitter)',
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function deriveChannel(utmSource?: string | null, utmMedium?: string | null, referrer?: string | null): string {
  const s = (utmSource || '').trim().toLowerCase();
  if (s) {
    const medium = (utmMedium || '').toLowerCase();
    const isPaid = /(cpc|ppc|paid|ad|ads|reklama|banner|display)/.test(medium);
    const name = NAMES[s] || cap(s);
    return isPaid ? `${name} (реклама)` : name;
  }

  // No UTM tag → derive from the referring website.
  let host = '';
  try { host = new URL(referrer || '').hostname.replace(/^www\./, '').toLowerCase(); } catch { /* none */ }
  if (!host) return 'Директно';
  if (/facebook|fb\.com|fb\.me|l\.facebook/.test(host)) return 'Facebook';
  if (/instagram/.test(host)) return 'Instagram';
  if (/tiktok/.test(host)) return 'TikTok';
  if (/(google|bing|yahoo|duckduckgo|search)/.test(host)) return 'Търсачка';
  if (/youtube/.test(host)) return 'YouTube';
  if (/(t\.co|twitter|x\.com)/.test(host)) return 'X (Twitter)';
  return host; // some other site
}
