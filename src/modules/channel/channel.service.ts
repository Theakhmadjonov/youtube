import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class ChannelService {
  constructor(private readonly db: PrismaService) {}

  async getChannelByUsername(username: string, currentUserId: string) {
    const user = await this.db.prisma.user.findUnique({
      where: { username },
      include: {
        videos: true,
        subscribers: true,
      },
    });
    if (!user) throw new NotFoundException('Channel not found');
    let isSubscribed = false;
    if (currentUserId) {
      const subscription = await this.db.prisma.subscription.findUnique({
        where: {
          subscriberId_channelId: {
            subscriberId: currentUserId,
            channelId: user.id,
          },
        },
      });
      isSubscribed = !!subscription;
    }
    const totalViews = await this.db.prisma.video.aggregate({
      where: { authorId: user.id },
      _sum: { viewsCount: true },
    });

    return {
      id: user.id,
      username: user.username,
      channelName: user.firstName + ' ' + user.lastName,
      channelDescription: user['channelDescription'] || '',
      avatar: user.avatar,
      channelBanner: user['channelBanner'] || '',
      subscribersCount: user.subscribers.length,
      totalViews: Number(totalViews._sum.viewsCount || 0),
      videosCount: user.videos.length,
      joinedAt: user.createdAt,
      isVerified: user.isEmailVerified,
      isSubscribed: !!isSubscribed,
    };
  }

  async getChannelVideos(
    username: string,
    page = 1,
    limit = 20,
    sort = 'newest',
  ) {
    const user = await this.db.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found');
    const videos = await this.db.prisma.video.findMany({
      where: { authorId: user.id },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: sort === 'oldest' ? 'asc' : 'desc',
      },
    });

    return videos;
  }

  async updateChannel(userId: string, dto: UpdateChannelDto) {
    await this.db.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.channelName,
        channelDescription: dto.channelDescription,
        channelBanner: dto.channelBanner,
      },
    });
    return { message: 'Channel updated successfully' };
  }

  async subscribe(subscriberId: string, channelId: string) {
    if (subscriberId === channelId) {
      throw new BadRequestException(`You can't subscribe to yourself`);
    }
    await this.db.prisma.subscription.upsert({
      where: {
        subscriberId_channelId: {
          subscriberId,
          channelId,
        },
      },
      create: {
        subscriberId,
        channelId,
      },
      update: {},
    });
    return { message: 'Subscribed successfully' };
  }

  async unsubscribe(subscriberId: string, channelId: string) {
    await this.db.prisma.subscription.deleteMany({
      where: {
        subscriberId,
        channelId,
      },
    });

    return { message: 'Unsubscribed successfully' };
  }

  async getSubscriptions(userId: string, page = 1, limit = 20) {
    const subs = await this.db.prisma.subscription.findMany({
      where: { subscriberId: userId },
      include: { channel: true },
      take: limit,
      skip: (page - 1) * limit,
    });

    return subs.map((sub) => ({
      id: sub.channel.id,
      username: sub.channel.username,
      channelName: sub.channel.firstName + ' ' + sub.channel.lastName,
      avatar: sub.channel.avatar,
      subscribedAt: sub.createdAt,
    }));
  }

  async getSubscriptionFeed(userId: string, page = 1, limit = 20) {
    const subscriptions = await this.db.prisma.subscription.findMany({
      where: { subscriberId: userId },
    });
    const channelIds = subscriptions.map((sub) => sub.channelId);
    const videos = await this.db.prisma.video.findMany({
      where: { authorId: { in: channelIds } },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
    });
    return videos;
  }
}
