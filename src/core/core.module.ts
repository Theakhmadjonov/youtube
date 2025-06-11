import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_KEY') as string, 
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class CoreModule {}
