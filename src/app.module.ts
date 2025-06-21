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
import { SearchModule } from './modules/search/search.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import VideoUploadService from './core/video-upload.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    CoreModule,
    VideoAnalyticsModule,
    ChannelModule,
    CommentModule,
    PlaylistModule,
    AdminModule,
    SearchModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
    }),
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
    VideoUploadService,
  ],
})
export class AppModule {}
