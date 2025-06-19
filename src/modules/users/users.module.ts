import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { EmaileService } from '../auth/email-otp.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, EmaileService]
})
export class UsersModule {}
