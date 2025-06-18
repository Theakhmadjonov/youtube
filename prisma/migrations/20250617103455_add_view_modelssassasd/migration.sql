/*
  Warnings:

  - Added the required column `repliesCount` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `replyId` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "repliesCount" INTEGER NOT NULL,
ADD COLUMN     "replyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
