import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { VideoAnalyticsModule } from './modules/video-analytics/video-analytics.module';
import { ChannelModule } from './modules/channel/channel.module';
import { CommentModule } from './modules/comment/comment.module';
import { PlaylistModule } from './modules/playlist/playlist.module';
import { AdminModule } from './modules/admin/admin.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import TransformInterceoptor from './common/interceptors/transform.interceptor';
import { AuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [
    CoreModule,
    VideoAnalyticsModule,
    ChannelModule,
    CommentModule,
    PlaylistModule,
    AdminModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceoptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
