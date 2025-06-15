-- CreateTable
CREATE TABLE "video_formats" (
    "id" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "video_formats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "video_formats" ADD CONSTRAINT "video_formats_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
