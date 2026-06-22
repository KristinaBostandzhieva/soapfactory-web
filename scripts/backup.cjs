// Database backup — copies the SQLite database to /backups with a timestamp,
// keeping the most recent 14 copies. Run with: npm run backup
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dbPath = path.join(root, 'prisma', 'dev.db');
const backupDir = path.join(root, 'backups');
const KEEP = 14;

if (!fs.existsSync(dbPath)) {
  console.error('Database not found at', dbPath);
  process.exit(1);
}
fs.mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16); // YYYY-MM-DD-HH-mm
const dest = path.join(backupDir, `dev-${stamp}.db`);
fs.copyFileSync(dbPath, dest);
console.log('✓ Backup created:', path.relative(root, dest));

// Prune oldest, keep the most recent KEEP copies.
const files = fs.readdirSync(backupDir)
  .filter((f) => f.startsWith('dev-') && f.endsWith('.db'))
  .sort();
while (files.length > KEEP) {
  const old = files.shift();
  fs.unlinkSync(path.join(backupDir, old));
  console.log('  pruned old backup:', old);
}
