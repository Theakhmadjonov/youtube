-- CreateEnum
CREATE TYPE "Category" AS ENUM ('EDUCATION', 'ENTERTAINMENT');

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'ENTERTAINMENT';
