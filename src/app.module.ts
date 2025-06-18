import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { VideoAnalyticsModule } from './modules/video-analytics/video-analytics.module';
import { ChannelModule } from './modules/channel/channel.module';
import { CommentModule } from './modules/comment/comment.module';
import { PlaylistModule } from './modules/playlist/playlist.module';

@Module({
  imports: [CoreModule, VideoAnalyticsModule, ChannelModule, CommentModule, PlaylistModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
