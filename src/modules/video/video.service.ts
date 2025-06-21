import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { PrismaService } from 'src/core/database/prisma.service';
import VideoUploadService from 'src/core/video-upload.service';
import { CreateVideoDto, UpdateVideoDto } from './dto/create-video.dto';
// import { Category } from '@prisma/client';

@Injectable()
export class VideoService {
  constructor(
    private videoUploadService: VideoUploadService,
    private db: PrismaService,
  ) {}
  async uploadVideo(file: Express.Multer.File, data: CreateVideoDto) {
    const fileName = file.filename;
    const videoPath = path.join(process.cwd(), 'uploads', fileName);
    const resolution: any =
      await this.videoUploadService.getVideoResolution(videoPath);
    const resolutions = [
      { height: 240 },
      { height: 360 },
      { height: 480 },
      { height: 720 },
      { height: 1080 },
    ];
    const validResolutions = resolutions.filter(
      (r) => r.height <= resolution.height + 6,
    );
    if (validResolutions.length > 0) {
      const folderPath = path.join(
        process.cwd(),
        'uploads',
        'videos',
        fileName.split('.')[0],
      );
      fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) throw new InternalServerErrorException(err);
      });
      await this.videoUploadService.convertToResolutions(
        videoPath,
        folderPath,
        validResolutions,
      );
      fs.unlinkSync(videoPath);
      const createdVideo = await this.db.prisma.video.create({
        data: {
          title: data.title,
          description: data.description,
          thumbnail: data.thumbnail,
          videoUrl: `${folderPath}/original.mp4`,
          duration: resolution.duration,
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          category: 'ENTERTAINMENT',
          authorId: data.authorId,
        },
      });
      await Promise.all(
        validResolutions.map(async (res) => {
          const resUrl = `uploads/videos/${fileName.split('.')[0]}/${res.height}p.mp4`;
          await this.db.prisma.videoFormats.create({
            data: {
              resolution: `${res.height}p`,
              url: resUrl,
              videoId: createdVideo.id,
            },
          });
        }),
      );
      return {
        message: 'success',
        videoId: createdVideo.id,
      };
    } else {
      console.log('❗ Video juda past sifatli, convert qilish kerak emas.');
      throw new InternalServerErrorException('Video sifati juda past.');
    }
  }

  async watchVideo(id: string, quality: string, range: string, res: Response) {
    const video = await this.db.prisma.video.findUnique({
      where: { id },
      include: { VideoFormats: true },
    });
    if (!video) {
      throw new NotFoundException('Video not found in database');
    }
    const formatExists = video.VideoFormats.some(
      (format) => format.resolution === `${quality}p`,
    );
    if (!formatExists) {
      throw new NotFoundException('Requested video quality not available');
    }
    await this.db.prisma.video.update({
      where: { id },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    });
    const baseQuality = `${quality}.mp4`;
    const videoPath = path.join(
      process.cwd(),
      'uploads',
      'videos',
      id,
      baseQuality,
    );
    if (!fs.existsSync(videoPath)) {
      throw new NotFoundException('Video file not found on server');
    }
    const { size } = fs.statSync(videoPath);
    if (!range) {
      range = `bytes=0-1048575`;
    }
    const { start, end, chunkSize } = this.videoUploadService.getChunkProps(
      range,
      size,
    );
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
    videoStream.on('error', (err) => {
      console.error('Stream error:', err);
      res.sendStatus(500);
    });
  }

  async getProcess(videoId: string) {
    try {
      const videoProcess = await this.db.prisma.video.findFirstOrThrow({
        where: { id: videoId },
        select: {
          id: true,
          status: true,
        },
      });
      return {
        success: true,
        data: {
          ...videoProcess,
        },
      };
    } catch (error) {
      throw new NotFoundException('Video not found');
    }
  }

  async getVideoDetails(videoId: string) {
    try {
      const videoProcess = await this.db.prisma.video.findFirstOrThrow({
        where: { id: videoId },
        select: {
          id: true,
          status: true,
          author: true,
          category: true,
          createdAt: true,
          title: true,
          likes: true,
          dislikesCount: true,
          comments: true,
        },
      });
      return {
        success: true,
        data: {
          ...videoProcess,
        },
      };
    } catch (error) {
      throw new NotFoundException('Video not found');
    }
  }

  async updateVideo(videoId: string, userId: string, data: UpdateVideoDto) {
    const checkVideo = await this.db.prisma.video.findFirst({
      where: { id: videoId, authorId: userId },
    });
    if (!checkVideo)
      throw new BadRequestException('Video not found or forbid resource');
    const updatedVideo = await this.db.prisma.video.update({
      where: { id: videoId },
      data: {
        ...data,
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
        category: 'ENTERTAINMENT',
      },
    });
    return updatedVideo;
  }

  async deleteVideo(videoId: string, userId: string) {
    const checkVideo = await this.db.prisma.video.findFirst({
      where: { id: videoId, authorId: userId },
    });
    if (!checkVideo)
      throw new BadRequestException('Video not found or forbid resource');
    const updatedVideo = await this.db.prisma.video.delete({
      where: { id: videoId },
    });
    return updatedVideo;
  }

  async getVideoFeed(
    limit: number,
    page: number,
    category: String,
    duration: number,
  ) {
    try {
      const findVideo = await this.db.prisma.video.findFirst({
        where: { category: 'ENTERTAINMENT', duration: duration },
        take: limit,
        skip: (page - 1) * limit,
      });
      return findVideo;
    } catch (error) {
      throw new BadRequestException('Video not found');
    }
  }

  async getVideoTrending() {
    try {
      const date = new Date();
      const findVideo = await this.db.prisma.video.findFirst({
        where: { createdAt: date },
      });
      return findVideo;
    } catch (error) {
      throw new BadRequestException('Video not found');
    }
  }
}
