import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import {
  CreatePlaylistDto,
  CreatePlaylistVideoDto,
} from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Request } from 'express';

@UseGuards(AuthGuard)
@Controller()
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post('playlists')
  async create(
    @Body() createPlaylistDto: CreatePlaylistDto,
    @Req() req: Request,
  ) {
    try {
      const userId = req['userId'];
      return await this.playlistService.create(createPlaylistDto, userId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('playlists/:id/videos')
  async addVideoToPlaylist(
    @Body() videoId: string,
    @Param('id') data: CreatePlaylistVideoDto,
    @Req() req: Request,
  ) {
    try {
      const userId = req['userId'];
      return await this.playlistService.addVideoToPLaylist(
        userId,
        videoId,
        data,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('playlists/:id')
  async getPlaylist(@Param('id') playlistId: string, @Req() req: Request) {
    try {
      const userId = req['userId'];
      return await this.playlistService.getPLaylist(userId, playlistId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('users/:userId/playlists')
  async getUserPlaylits(
    @Param('userId') id: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
  ) {
    try {
      return await this.playlistService.getUserPlaylists(id, +limit, +page);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('playlists/:id')
  async update(
    @Param('id') playlistId: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @Req() req: Request,
  ) {
    try {
      const userId = req['userId'];
      return await this.playlistService.update(
        playlistId,
        updatePlaylistDto,
        userId,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('playlists/:id/videos/:videoId')
  async remove(
    @Param('id') playlistId: string,
    @Param('videoId') videoId: string,
    @Req() req: Request,
  ) {
    try {
      const userId = req['userId'];
      return await this.playlistService.remove(userId, playlistId, videoId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
