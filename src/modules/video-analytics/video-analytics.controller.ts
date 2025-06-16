import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { VideoAnalyticsService } from './video-analytics.service';

@UseGuards(AuthGuard)
@Controller('videos/:id')
export class VideoAnalyticsController {
  constructor(private readonly analyticsService: VideoAnalyticsService) {}

  @Post('view')
  async recordView(@Param('id') videoId: string, @Body() body: any) {
    try {
      return await this.analyticsService.recordView(videoId, body);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('analytics')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['admin', 'superadmin'])
  async getAnalytics(
    @Param('id') videoId: string,
    @Query('timeframe') timeframe: string,
    @Req() req: Request,
  ) {
    try {
      const userId = req['userId'];
      return await this.analyticsService.getAnalytics(
        videoId,
        timeframe,
        userId,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
