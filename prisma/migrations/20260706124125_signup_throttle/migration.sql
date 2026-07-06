-- CreateTable
CREATE TABLE "SignupIpLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PendingSignup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_PendingSignup" ("attempts", "code", "createdAt", "email", "expiresAt", "id", "name", "passwordHash") SELECT "attempts", "code", "createdAt", "email", "expiresAt", "id", "name", "passwordHash" FROM "PendingSignup";
DROP TABLE "PendingSignup";
ALTER TABLE "new_PendingSignup" RENAME TO "PendingSignup";
CREATE UNIQUE INDEX "PendingSignup_email_key" ON "PendingSignup"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SignupIpLog_ip_createdAt_idx" ON "SignupIpLog"("ip", "createdAt");
