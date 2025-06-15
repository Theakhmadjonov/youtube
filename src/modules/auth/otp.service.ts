import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisService } from 'src/core/database/redis.service';
import { generate } from 'otp-generator';
import { SMSService } from './sms.service';
import OtpSecurityService from './otp.security.service'

@Injectable()
export class OtpService {
  constructor(
    private redis: RedisService,
    private sms: SMSService,
    private otpSecurity: OtpSecurityService,
  ) {}

  generateOtp() {
    const otp = generate(4, {
      digits: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });
    return otp;
  }

  getSessionToken() {
    const token = crypto.randomUUID();
    return token;
  }

  async sendOtp(phone: string) {
    await this.otpSecurity.checkIfTemporaryBlockedUser(phone);
    await this.checkOtp(`user:${phone}`);
    const tempOtp = this.generateOtp();
    const responseRedis = await this.redis.setOtp(phone, tempOtp);
    if (responseRedis == 'ok') {
      await this.sms.sendSms(phone, tempOtp);
      return true;
    }
  }

  async checkOtp(key: string) {
    const checkOtp = await this.redis.getOtp(key);
    if (checkOtp) {
      const ttl = await this.redis.getTTl(key);
      throw new BadRequestException(`Please try again after ${ttl} seconds`);
    }
  }

  async verifyOtpSendedCode(key: string, code: string, phone: string) {
    await this.otpSecurity.checkIfTemporaryBlockedUser(phone);
    const otp = await this.redis.getOtp(key);
    if (!otp) {
      throw new BadRequestException('Code invalid');
    }
    if (otp !== code) {
      const attempts = await this.otpSecurity.recordFailedOtpAttempts(phone);
      throw new BadRequestException({
        message: 'Code invalid',
        attempts: `You have ${attempts} attempts`,
      });
    }
    await this.redis.delOtp(key);
    await this.otpSecurity.delOtpAttempts(`otp_attempts:${phone}`);
    const sessionToken = this.getSessionToken();
    await this.redis.setSessionTokenUser(phone, sessionToken);
    return sessionToken;
  }

  async verifySendedCodeLogin(key: string, code: string) {
    const otp = await this.redis.getOtp(key);
    if (!otp || otp !== code) throw new BadRequestException('Code invalid');
    await this.redis.delOtp(key);
    return true;
  }

  async CheckTokenUSer(key: string, token: string) {
    const sessionToken = await this.redis.getKey(key);
    if (!sessionToken || sessionToken !== token)
      throw new BadRequestException('Session token expired');
    return true;
  }

  async delTokenUser(key: string) {
    await this.redis.delOtp(key);
  }
}
