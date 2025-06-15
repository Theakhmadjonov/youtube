import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailService } from '../auth/email-otp.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, EmailService]
})
export class UsersModule {}
