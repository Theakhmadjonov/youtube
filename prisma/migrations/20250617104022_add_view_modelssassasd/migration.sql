/*
  Warnings:

  - You are about to drop the column `repliesCount` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `replyId` on the `comments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "comments" DROP COLUMN "repliesCount",
DROP COLUMN "replyId";
