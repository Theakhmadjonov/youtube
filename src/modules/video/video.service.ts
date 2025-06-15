import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { promises as fs } from 'fs';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class VideoService {
  private outputPath = path.join(process.cwd(), 'uploads', 'converted');

  constructor(private db: PrismaService) {}

  async createVideo(dto: CreateVideoDto, file: Express.Multer.File) {
    try {
      const convertedFormats = await this.convertVideo(file);
      const duration = await this.getVideoDuration(convertedFormats[0].path);
      const newVideo = await this.db.prisma.video.create({
        data: {
          ...dto,
          videoUrl: convertedFormats[0].path,
          duration,
          status: 'PUBLISHED',
        },
      });
      await this.db.prisma.videoFormats.createMany({
        data: convertedFormats.map((format) => ({
          videoId: newVideo.id,
          resolution: format.label,
          url: format.path,
        })),
      });
      return newVideo;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Video upload failed');
    }
  }

  private async convertVideo(
    file: Express.Multer.File,
  ): Promise<{ label: string; path: string }[]> {
    const inputPath = file.path;
    const fileName = path.parse(file.filename).name;

    const resolutions = [
      { label: '360p', size: '640x360' },
      { label: '480p', size: '854x480' },
      { label: '720p', size: '1280x720' },
      { label: '1080p', size: '1920x1080' },
    ];
    await fs.mkdir(this.outputPath, { recursive: true });
    const conversionPromises = resolutions.map(({ label, size }) => {
      const outputFilePath = path.join(
        this.outputPath,
        `${fileName}_${label}.mp4`,
      );
      return new Promise<{ label: string; path: string }>((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions('-preset veryfast')
          .size(size)
          .output(outputFilePath)
          .on('end', () => resolve({ label, path: outputFilePath }))
          .on('error', (err) => reject(`Error in ${label}: ${err.message}`))
          .run();
      });
    });

    return await Promise.all(conversionPromises);
  }

  private getVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);
        resolve(Math.floor(metadata.format.duration || 0));
      });
    });
  }

  async getOneVideo(id: string) {
    try {
      return await this.db.prisma.video.findFirstOrThrow({
        where: { id },
        select: {
          VideoFormats: true,
          author: true,
          authorId: true,
          createdAt: true,
          description: true,
          duration: true,
          likes: true,
          likesCount: true,
          dislikesCount: true,
          PlaylistVideo: true,
          status: true,
          comments: true,
          thumbnail: true,
          id: true,
          title: true,
          videoUrl: true,
          viewsCount: true,
          visibility: true,
        },
      });
    } catch (error) {
      throw new NotFoundException('Video not found');
    }
  }

  async getVideos() {
    try {
      return await this.db.prisma.video.findMany({
        select: {
          VideoFormats: true,
          author: true,
          authorId: true,
          createdAt: true,
          description: true,
          duration: true,
          likes: true,
          likesCount: true,
          dislikesCount: true,
          PlaylistVideo: true,
          status: true,
          comments: true,
          thumbnail: true,
          id: true,
          title: true,
          videoUrl: true,
          viewsCount: true,
          visibility: true,
          _count: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getVideoWithQuery(id: string, query: string) {
    try {
      return await this.db.prisma.videoFormats.findFirstOrThrow({
        where: { videoId: id, resolution: query },
      });
    } catch (error) {
      throw new NotFoundException('Video not found');
    }
  }
}
