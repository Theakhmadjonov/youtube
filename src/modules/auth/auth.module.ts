import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OtpService } from './otp.service';
import { SMSService } from './sms.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, OtpService, SMSService],
})
export class AuthModule {}
