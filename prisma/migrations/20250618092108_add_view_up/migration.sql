-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'block', 'verify');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'active';
