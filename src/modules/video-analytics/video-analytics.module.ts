import { Module } from '@nestjs/common';
import { VideoAnalyticsController } from './video-analytics.controller';
import { VideoAnalyticsService } from './video-analytics.service';

@Module({
  controllers: [VideoAnalyticsController],
  providers: [VideoAnalyticsService],
})
export class VideoAnalyticsModule {}
