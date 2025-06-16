-- CreateTable
CREATE TABLE "views" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "watchTime" INTEGER NOT NULL,
    "quality" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "views_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "views" ADD CONSTRAINT "views_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
