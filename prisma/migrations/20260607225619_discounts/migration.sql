-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'percent',
    "value" REAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "minSubtotal" REAL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postcode" TEXT,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "subtotal" REAL NOT NULL,
    "shipping" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'cod',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "stripeSessionId" TEXT,
    "courier" TEXT,
    "deliveryType" TEXT,
    "officeCode" TEXT,
    "officeName" TEXT,
    "trackingNumber" TEXT,
    "labelUrl" TEXT,
    "confirmationSentAt" DATETIME,
    "discountCode" TEXT,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("address", "city", "confirmationSentAt", "courier", "createdAt", "customerName", "deliveryType", "email", "id", "labelUrl", "notes", "officeCode", "officeName", "paymentMethod", "paymentStatus", "phone", "postcode", "shipping", "status", "stripeSessionId", "subtotal", "total", "trackingNumber", "updatedAt", "userId") SELECT "address", "city", "confirmationSentAt", "courier", "createdAt", "customerName", "deliveryType", "email", "id", "labelUrl", "notes", "officeCode", "officeName", "paymentMethod", "paymentStatus", "phone", "postcode", "shipping", "status", "stripeSessionId", "subtotal", "total", "trackingNumber", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Discount_code_key" ON "Discount"("code");
