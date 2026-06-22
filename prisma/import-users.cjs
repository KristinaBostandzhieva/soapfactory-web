// One-time import of WordPress/WooCommerce users from data/users.csv
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- minimal RFC-4180 CSV parser (handles quotes, embedded commas/newlines) ---
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function hashType(h) {
  if (!h) return null;
  if (h.startsWith('$wp$')) return 'wp';
  if (h.startsWith('$P$') || h.startsWith('$H$')) return 'phpass';
  if (/^\$2[aby]\$/.test(h)) return 'bcrypt';
  return 'unknown';
}

async function main() {
  const file = path.join(__dirname, '..', 'data', 'users.csv');
  const rows = parseCSV(fs.readFileSync(file, 'utf8'));
  const header = rows[0].map((h) => h.trim());
  const col = (name) => header.indexOf(name);
  const idx = {
    wpId: col('ID'), login: col('user_login'), pass: col('user_pass'),
    email: col('user_email'), display: col('display_name'),
    first: col('first_name'), last: col('last_name'), roles: col('roles'),
    phone: col('billing_phone'), addr1: col('billing_address_1'), addr2: col('billing_address_2'),
    city: col('billing_city'), postcode: col('billing_postcode'), country: col('billing_country'),
    guest: col('is_guest_user'),
  };

  let imported = 0, skippedNoPass = 0, skippedDup = 0, admins = 0;
  const seenEmail = new Set();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 3) continue;
    const email = (row[idx.email] || '').trim().toLowerCase();
    const pass = (row[idx.pass] || '').trim();
    if (!email) continue;
    if (!pass) { skippedNoPass++; continue; }
    if (seenEmail.has(email)) { skippedDup++; continue; }
    seenEmail.add(email);

    const ht = hashType(pass);
    const rolesStr = (row[idx.roles] || '').toLowerCase();
    const isAdmin = rolesStr.includes('administrator') || rolesStr.includes('shop_manager');
    if (isAdmin) admins++;

    const name =
      (row[idx.display] || '').trim() ||
      [row[idx.first], row[idx.last]].map((x) => (x || '').trim()).filter(Boolean).join(' ') ||
      null;
    const address = [row[idx.addr1], row[idx.addr2]].map((x) => (x || '').trim()).filter(Boolean).join(', ') || null;

    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        wpId: parseInt(row[idx.wpId]) || null,
        email,
        name,
        passwordHash: pass,
        hashType: ht || 'unknown',
        role: isAdmin ? 'admin' : 'user',
        phone: (row[idx.phone] || '').trim() || null,
        address,
        city: (row[idx.city] || '').trim() || null,
        postcode: (row[idx.postcode] || '').trim() || null,
        country: (row[idx.country] || '').trim() || null,
      },
    });
    imported++;
  }

  console.log(`✅ Imported ${imported} users (${admins} admin/manager).`);
  console.log(`   Skipped: ${skippedNoPass} without password, ${skippedDup} duplicate emails.`);
  const byType = await prisma.user.groupBy({ by: ['hashType'], _count: true });
  console.log('   Hash types in DB:', byType.map((t) => `${t.hashType}=${t._count}`).join(', '));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
