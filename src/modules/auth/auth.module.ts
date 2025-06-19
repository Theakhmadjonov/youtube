import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { SMSService } from './sms.service';
import { OtpSecurityService } from './otp.security.service';
import { EmaileService } from './email-otp.service';
import { ConfigModule } from '@nestjs/config';
import { ResendModule } from 'nestjs-resend';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    SMSService,
    OtpSecurityService,
    EmaileService,
  ],
  exports: [OtpService, SMSService, OtpSecurityService, EmaileService],
})
export class AuthModule {}
