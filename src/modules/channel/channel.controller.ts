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
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ChannelService } from './channel.service';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Controller()
@UseGuards(AuthGuard)
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('/channels/:username')
  async getChannel(@Param('username') username: string, @Req() req: Request) {
    try {
      const userId = req['userId'];
      return await this.channelService.getChannelByUsername(username, userId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/channels/:username/videos')
  async getChannelVideos(
    @Param('username') username: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('sort') sort = 'newest',
  ) {
    try {
      return await this.channelService.getChannelVideos(
        username,
        Number(page),
        Number(limit),
        sort,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('/channels/me')
  async updateChannel(@Req() req: Request, @Body() dto: UpdateChannelDto) {
    try {
      const userId = req['userId'];
      return await this.channelService.updateChannel(userId, dto);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/channels/:userId/subscribe')
  async subscribe(@Param('userId') channelId: string, @Req() req: Request) {
    try {
      const subscriberId = req['userId'];
      return await this.channelService.subscribe(subscriberId, channelId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/channels/:userId/subscribe')
  async unsubscribe(@Param('userId') channelId: string, @Req() req: Request) {
    try {
      const subscriberId = req['userId'];
      return await this.channelService.unsubscribe(subscriberId, channelId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/subscriptions')
  async getSubscriptions(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    try {
      const userId = req['userId'];
      return await this.channelService.getSubscriptions(
        userId,
        Number(page),
        Number(limit),
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/subscriptions/feed')
  async getFeed(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    try {
      const userId = req['userId'];
      return await this.channelService.getSubscriptionFeed(
        userId,
        Number(page),
        Number(limit),
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
