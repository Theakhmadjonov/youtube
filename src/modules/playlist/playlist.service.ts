import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePlaylistDto,
  CreatePlaylistVideoDto,
} from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class PlaylistService {
  constructor(private db: PrismaService) {}

  async create(createPlaylistDto: CreatePlaylistDto, userId: string) {
    const checkPlaylist = await this.db.prisma.playlist.findFirst({
      where: { authorId: userId, title: createPlaylistDto.title },
    });
    if (checkPlaylist)
      throw new ConflictException('This playlist already exists');
    const newPlaylist = await this.db.prisma.playlist.create({
      data: { ...createPlaylistDto, authorId: userId },
    });
    return newPlaylist;
  }

  async addVideoToPLaylist(
    userId: string,
    videoId: string,
    data: CreatePlaylistVideoDto,
  ) {
    const chechkPLaylist = await this.db.prisma.playlist.findFirst({
      where: { authorId: userId, id: data.playlistId },
    });
    if (!chechkPLaylist)
      throw new BadRequestException('This playlist or user not found');
    const chechkVideo = await this.db.prisma.video.findFirst({
      where: { id: videoId },
    });
    if (!chechkVideo) throw new NotFoundException('Video not found');
    const playlistVideo = await this.db.prisma.playlistVideo.create({
      data: { ...data, videoId: videoId },
      select: {
        playlist: true,
        addedAt: true,
        id: true,
        video: true,
        videoId: true,
        position: true,
      },
    });
    return playlistVideo;
  }

  async getPLaylist(userId: string, playlistId: string) {
    const findPlaylist = await this.db.prisma.playlist.findFirst({
      where: { id: playlistId },
      select: {
        _count: true,
        author: true,
        description: true,
        title: true,
        videos: true,
        visibility: true,
      },
    });
    if (!findPlaylist) throw new NotFoundException('Playlist not found');
    if (findPlaylist.visibility !== 'PUBLIC')
      throw new ForbiddenException('Forbidden resource');
    return findPlaylist;
  }

  async getUserPlaylists(userId: string, limit: number = 20, page: number = 1) {
    const playlists = await this.db.prisma.playlist.findMany({
      where: {
        authorId: userId,
      },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        _count: true,
        title: true,
        visibility: true,
        id: true,
      },
    });
    return playlists;
  }

  async update(
    playlistId: string,
    updatePlaylistDto: UpdatePlaylistDto,
    userId: string,
  ) {
    const chechkPlaylist = await this.db.prisma.playlist.findFirst({
      where: { authorId: userId, id: playlistId },
    });
    if (!chechkPlaylist)
      throw new BadRequestException('This playlist or user not found');
    const updatedPalylist = await this.db.prisma.playlist.update({
      where: { id: playlistId },
      data: {
        ...updatePlaylistDto,
      },
    });
    return updatedPalylist;
  }

  async remove(userId: string, playlistId: string, videoId: string) {
    const chechkPlaylist = await this.db.prisma.playlist.findFirst({
      where: { authorId: userId, id: playlistId },
    });
    if (!chechkPlaylist)
      throw new BadRequestException('This playlist or user not found');
    const deletedVideo = await this.db.prisma.playlistVideo.delete({
      where: { playlistId: playlistId, id: videoId },
    });
    return deletedVideo;
  }
}
