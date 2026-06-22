// Promote an existing user account to admin (or create a new admin).
//
// Recommended (most secure — you set your own password):
//   1) Register normally on the site at /registratsiya with your email + password.
//   2) Run:  node prisma/make-admin.cjs your@email.com
//
// Or create a brand-new admin directly (password becomes a CLI argument):
//   node prisma/make-admin.cjs your@email.com "MyPassword123" "Име Фамилия"
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  const [, , emailArg, password, name] = process.argv;
  const email = (emailArg || '').trim().toLowerCase();
  if (!email) {
    console.error('Usage: node prisma/make-admin.cjs <email> [password] [name]');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({ where: { email }, data: { role: 'admin' } });
    console.log(`✓ "${email}" is now an ADMIN (password unchanged).`);
  } else {
    if (!password) {
      console.error(`No user with "${email}". To create one, pass a password:`);
      console.error(`  node prisma/make-admin.cjs ${email} "YourPassword" "Име Фамилия"`);
      process.exit(1);
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { email, name: name || null, passwordHash, hashType: 'bcrypt', role: 'admin' },
    });
    console.log(`✓ Created new ADMIN account "${email}".`);
  }
  await prisma.$disconnect();
})();
