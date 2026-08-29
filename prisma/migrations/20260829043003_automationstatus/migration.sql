/*
  Warnings:

  - The values [MAINTENANCE,DISCONTINUED] on the enum `AutomationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AutomationStatus_new" AS ENUM ('ACTIVE', 'COMPLETED', 'IN_INCIDENT');
ALTER TABLE "public"."automations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "automations" ALTER COLUMN "status" TYPE "AutomationStatus_new" USING ("status"::text::"AutomationStatus_new");
ALTER TYPE "AutomationStatus" RENAME TO "AutomationStatus_old";
ALTER TYPE "AutomationStatus_new" RENAME TO "AutomationStatus";
DROP TYPE "public"."AutomationStatus_old";
ALTER TABLE "automations" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "automations" ADD COLUMN     "statusChangedAt" TIMESTAMP(3);
