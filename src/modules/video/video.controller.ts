import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadInterceptor } from 'src/interceptors/file-upload.interceptor';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoService } from './video.service';
@Controller('movies')
export class VideosController {
  constructor(private readonly videoService: VideoService) {}

  @Post('/video/upload')
  @UseInterceptors(FileUploadInterceptor)
  async uploadVideo(
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      return await this.videoService.createVideo(createVideoDto, file);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getOneVideo(@Param('id') id: string) {
    try {
      return await this.videoService.getOneVideo(id);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getVideos() {
    try {
      return await this.videoService.getVideos();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/format')
  async getVideoWithQuery(
    @Param('id') id: string,
    @Query('format') format: string,
  ) {
    try {
      return await this.videoService.getVideoWithQuery(id, format);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
