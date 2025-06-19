import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { diskStorage } from 'multer';
import path from 'path';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateVideoDto, UpdateVideoDto } from './dto/create-video.dto';
import { VideoService } from './video.service';
import { Category } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller()
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('/videos/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (req, file, callback) => {
          const mimeType = path.extname(file.originalname);
          const fileName = `${Date.now()}${mimeType}`;
          callback(null, fileName);
        },
      }),
    }),
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: CreateVideoDto,
  ) {
    try {
      return await this.videoService.uploadVideo(file, data);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('watch/video/:id')
  async watchVideo(
    @Param('id') id: string,
    @Query('quality') quality: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const param = id;
      const contentRange = req.headers.range;
      await this.videoService.watchVideo(
        param,
        quality,
        contentRange as string,
        res,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/videos/:id/status')
  async getVideoProcess(@Param('id') videoId: string) {
    try {
      return await this.videoService.getProcess(videoId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/videos/:id')
  async getVideodetails(@Param('id') videoId: string) {
    try {
      return await this.videoService.getVideoDetails(videoId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('/videos/:id')
  async updateVideo(
    @Param('id') videoId: string,
    @Body() data: UpdateVideoDto,
    @Req() req: Request,
  ) {
    try {
      const userId = req['userId'];
      return await this.videoService.updateVideo(videoId, userId, data);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/videos/:id')
  async deleteVideo(@Param('id') videoId: string, @Req() req: Request) {
    try {
      const userId = req['userId'];
      return await this.videoService.deleteVideo(videoId, userId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/videos/feed')
  async getVideoFeed(
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Query('category') category: Category,
    @Query('duration') duration: string,
  ) {
    try {
      return await this.videoService.getVideoFeed(
        +limit,
        +page,
        category,
        +duration,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/videos/trending')
  async getVideoTrending() {
    try {
      return await this.videoService.getVideoTrending();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
