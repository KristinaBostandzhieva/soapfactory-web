-- AlterTable
ALTER TABLE "Order" ADD COLUMN "source" TEXT;
ALTER TABLE "Order" ADD COLUMN "utmCampaign" TEXT;

-- AlterTable
ALTER TABLE "PageView" ADD COLUMN "utmCampaign" TEXT;
ALTER TABLE "PageView" ADD COLUMN "utmMedium" TEXT;
ALTER TABLE "PageView" ADD COLUMN "utmSource" TEXT;
