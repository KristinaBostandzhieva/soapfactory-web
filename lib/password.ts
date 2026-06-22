import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Password hashing & verification supporting:
 *  - bcrypt              (our format for new/upgraded users)
 *  - phpass  $P$ / $H$   (legacy WordPress)
 *  - $wp$    $wp$2y$...  (WordPress 6.8+, bcrypt over an HMAC-SHA384 pre-hash)
 */

const ITOA64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function encode64(input: Buffer, count: number): string {
  let output = '';
  let i = 0;
  do {
    let value = input[i++];
    output += ITOA64[value & 0x3f];
    if (i < count) value |= input[i] << 8;
    output += ITOA64[(value >> 6) & 0x3f];
    if (i++ >= count) break;
    if (i < count) value |= input[i] << 16;
    output += ITOA64[(value >> 12) & 0x3f];
    if (i++ >= count) break;
    output += ITOA64[(value >> 18) & 0x3f];
  } while (i < count);
  return output;
}

// phpass portable hash (WordPress legacy $P$ / $H$)
function phpassCrypt(password: string, setting: string): string {
  if (setting.substring(0, 3) !== '$P$' && setting.substring(0, 3) !== '$H$') return '*0';
  const countLog2 = ITOA64.indexOf(setting[3]);
  if (countLog2 < 7 || countLog2 > 30) return '*0';
  let count = 1 << countLog2;
  const salt = setting.substring(4, 12);
  if (salt.length !== 8) return '*0';

  const pwd = Buffer.from(password, 'utf8');
  let hash = crypto.createHash('md5').update(Buffer.concat([Buffer.from(salt, 'binary'), pwd])).digest();
  do {
    hash = crypto.createHash('md5').update(Buffer.concat([hash, pwd])).digest();
  } while (--count);

  return setting.substring(0, 12) + encode64(hash, 16);
}

function verifyPhpass(password: string, hash: string): boolean {
  const computed = phpassCrypt(password, hash);
  // constant-time compare
  if (computed.length !== hash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

// WordPress 6.8+ pre-hash: base64( HMAC-SHA384(password, 'wp-sha384') )
function wpNormalize(password: string): string {
  return crypto.createHmac('sha384', 'wp-sha384').update(password.trim()).digest('base64');
}

async function verifyWp(password: string, hash: string): Promise<boolean> {
  // stored as "$wp$2y$..."; strip the "$wp" prefix to get a standard bcrypt hash
  const bcryptHash = hash.slice(3);
  return bcrypt.compare(wpNormalize(password), bcryptHash);
}

export type HashType = 'bcrypt' | 'phpass' | 'wp' | 'unknown';

export function detectHashType(hash: string): HashType {
  if (hash.startsWith('$wp$')) return 'wp';
  if (hash.startsWith('$P$') || hash.startsWith('$H$')) return 'phpass';
  if (/^\$2[aby]\$/.test(hash)) return 'bcrypt';
  return 'unknown';
}

export async function verifyPassword(password: string, hash: string, type?: string): Promise<boolean> {
  const t = (type as HashType) || detectHashType(hash);
  try {
    if (t === 'wp') return await verifyWp(password, hash);
    if (t === 'phpass') return verifyPhpass(password, hash);
    if (t === 'bcrypt') return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
  return false;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
