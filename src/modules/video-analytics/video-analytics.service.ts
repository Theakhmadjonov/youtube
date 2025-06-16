import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { subDays, eachDayOfInterval } from 'date-fns';

@Injectable()
export class VideoAnalyticsService {
  constructor(private readonly db: PrismaService) {}

  async recordView(videoId: string, data: any) {
    const video = await this.db.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');

    await this.db.prisma.view.create({
      data: {
        videoId,
        watchTime: data.watchTime,
        quality: data.quality,
        device: data.device,
        location: data.location,
      },
    });

    await this.db.prisma.video.update({
      where: { id: videoId },
      data: { viewsCount: { increment: 1 } },
    });

    return { success: true };
  }

  async getAnalytics(videoId: string, timeframe: string, userId: string) {
    const video = await this.db.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');
    if (video.authorId !== userId) throw new ForbiddenException();

    const days = this.parseTimeframe(timeframe);
    const startDate = subDays(new Date(), days);

    const views = await this.db.prisma.view.findMany({
      where: {
        videoId,
        createdAt: { gte: startDate },
      },
    });

    const totalViews = views.length;
    const totalWatchTime = views.reduce((sum, v) => sum + v.watchTime, 0);
    const averageViewDuration = totalViews > 0 ? Math.round(totalWatchTime / totalViews) : 0;

    const viewsByDay = this.aggregateViewsByDay(views, days);
    const viewsByCountry = this.groupBy(views, 'location');
    const deviceBreakdown = this.groupBy(views, 'device');
    const retention = this.calculateRetention(views);

    return {
      success: true,
      data: {
        totalViews,
        totalWatchTime,
        averageViewDuration,
        viewsByDay,
        viewsByCountry,
        deviceBreakdown,
        retention,
      },
    };
  }

  private parseTimeframe(tf: string): number {
    if (tf === '7d') return 7;
    if (tf === '30d') return 30;
    return 7;
  }

  private aggregateViewsByDay(views: any[], days: number) {
    const now = new Date();
    const start = subDays(now, days);
    const allDates = eachDayOfInterval({ start, end: now }).map((d) => d.toISOString().split('T')[0]);

    const map = new Map<string, { date: string; views: number; watchTime: number }>();
    for (const date of allDates) {
      map.set(date, { date, views: 0, watchTime: 0 });
    }

    for (const view of views) {
      const date = view.createdAt.toISOString().split('T')[0];
      const entry = map.get(date);
      if (entry) {
        entry.views += 1;
        entry.watchTime += view.watchTime;
      }
    }

    return Array.from(map.values());
  }

  private groupBy(arr: any[], key: string) {
    const counts: Record<string, number> = {};
    for (const item of arr) {
      const k = item[key] || 'unknown';
      counts[k] = (counts[k] || 0) + 1;
    }

    return Object.entries(counts).map(([value, count]) => ({
      [key]: value,
      views: count,
    }));
  }

  private calculateRetention(views: any[]) {
    const buckets = [0, 30, 60, 120];
    const retentionMap = new Map<number, number>();

    for (const b of buckets) retentionMap.set(b, 0);
    for (const view of views) {
      for (const b of buckets) {
        if (view.watchTime >= b) {
          retentionMap.set(b, retentionMap.get(b)! + 1);
        }
      }
    }

    const total = views.length || 1;
    return Array.from(retentionMap.entries()).map(([time, count]) => ({
      time,
      percentage: Math.round((count / total) * 100),
    }));
  }
}
