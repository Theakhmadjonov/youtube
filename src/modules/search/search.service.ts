import { Injectable } from '@nestjs/common';
// import { VideoStatus, Visibility } from '@prisma/client';
import { subDays, subHours, subMonths, subWeeks, subYears } from 'date-fns';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    query: string,
    type: string,
    limit: number,
    page: number,
    sort: string,
    duration: string,
    uploaded: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
    };
    if (duration !== 'any') {
      where.duration =
        duration === 'short'
          ? { lt: 240 }
          : duration === 'medium'
            ? { gte: 240, lt: 1200 }
            : { gte: 1200 };
    }
    if (uploaded !== 'anytime') {
      const now = new Date();
      const uploadedMap = {
        hour: subHours(now, 1),
        today: subDays(now, 1),
        week: subWeeks(now, 1),
        month: subMonths(now, 1),
        year: subYears(now, 1),
      };
      where.createdAt = { gte: uploadedMap[uploaded] };
    }
    const orderByMap = {
      relevance: undefined,
      upload_date: { createdAt: 'desc' },
      view_count: { viewsCount: 'desc' },
      rating: { likesCount: 'desc' },
    };
    if (type === 'videos' || type === 'all') {
      const videos = await this.prisma.prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderByMap[sort] || undefined,
      });
      return { success: true, type: 'videos', data: videos };
    }
    if (type === 'channels') {
      const users = await this.prisma.prisma.user.findMany({
        where: {
          OR: [
            { channelName: { contains: query, mode: 'insensitive' } },
            { channelDescription: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
      });
      return { success: true, type: 'channels', data: users };
    }

    if (type === 'playlists') {
      const playlists = await this.prisma.prisma.playlist.findMany({
        where: {
          title: { contains: query, mode: 'insensitive' },
        },
        skip,
        take: limit,
      });
      return { success: true, type: 'playlists', data: playlists };
    }
    return { success: true, type: 'unknown', data: [] };
  }

  async getSuggestions(query: string) {
    const videos = await this.prisma.prisma.video.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        title: true,
      },
      take: 10,
    });
    const suggestions = videos.map((v) => v.title);
    return { success: true, data: suggestions };
  }

  async getRecommendations(limit: number, page: number, videoId: string) {
    const skip = (page - 1) * limit;
    const video = videoId
      ? await this.prisma.prisma.video.findUnique({ where: { id: videoId } })
      : null;
    const where = {
      status: 'PUBLISHED' as any,
      visibility: 'PUBLIC' as any,
      ...(video?.category && { category: video.category }),
      ...(video?.id && { NOT: { id: video.id } }),
    };
    const videos = await this.prisma.prisma.video.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        viewsCount: 'desc',
      },
    });
    return {
      success: true,
      data: videos,
    };
  }
}
