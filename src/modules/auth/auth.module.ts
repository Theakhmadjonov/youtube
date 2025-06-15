import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OtpService } from './otp.service';
import { SMSService } from './sms.service';
import OtpSecurityService from './otp.security.service';
import { EmailService } from './email-otp.service';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, OtpService, SMSService, OtpSecurityService, EmailService],
  exports: [OtpSecurityService, EmailService, OtpService]
})
export class AuthModule {}
