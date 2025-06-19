import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisService } from 'src/core/database/redis.service';

@Injectable()
export class OtpSecurityService {
  private maxAttemptsOtp: number = 3;
  private blockedDuration: number = 3600;
  private otpAttemptsDuration: number = 3600;
  constructor(private redisService: RedisService) {}

  async recordFailedOtpAttempts(phone_number: string) {
    const key = `otp_attempts:${phone_number}`;
    const checkExistsKey = await this.redisService.redis.exists(key);
    if (!checkExistsKey) {
      await this.redisService.redis.incr(key);
      await this.redisService.redis.expire(key, this.otpAttemptsDuration);
    } else {
      await this.redisService.redis.incr(key);
    }
    const attempts = +((await this.redisService.getKey(key)) as string);
    const res = this.maxAttemptsOtp - attempts;
    if (res === 0) await this.temporaryBlockUser(phone_number, attempts);
    return res;
  }

  async recordFailedOtpAttemptsEmail(email: string) {
    const key = `otp_attempts_email:${email}`;
    const checkExistsKey = await this.redisService.redis.exists(key);
    if (!checkExistsKey) {
      await this.redisService.redis.incr(key);
      await this.redisService.redis.expire(key, this.otpAttemptsDuration);
    } else {
      await this.redisService.redis.incr(key);
    }
    const attempts = +((await this.redisService.getKey(key)) as string);
    const res = this.maxAttemptsOtp - attempts;
    if (res === 0) await this.temporaryBlockUserEmail(email, attempts);
    return res;
  }

  async temporaryBlockUser(phone_number: string, attempts: number) {
    const key = `temporary_blocked_user:${phone_number}`;
    const date = Date.now();
    await this.redisService.redis.setex(
      key,
      this.blockedDuration,
      JSON.stringify({
        blockedAt: date,
        attempts,
        reason: `To many attempts`,
        unblockedAt: date + this.blockedDuration * 1000,
      }),
    );
    await this.delOtpAttempts(`otp_attempts:${phone_number}`);
  }

  async temporaryBlockUserEmail(email: string, attempts: number) {
    const key = `temporary_blocked_user_email:${email}`;
    const date = Date.now();
    await this.redisService.redis.setex(
      key,
      this.blockedDuration,
      JSON.stringify({
        blockedAt: date,
        attempts,
        reason: `To many attempts`,
        unblockedAt: date + this.blockedDuration * 1000,
      }),
    );
    await this.delOtpAttempts(`otp_attempts_email:${email}`);
  }

  async checkIfTemporaryBlockedUser(phone_number: string) {
    const key = `temporary_blocked_user:${phone_number}`;
    const data = await this.redisService.getKey(key);
    if (data) {
      const ttlKey = await this.redisService.getTTl(key);
      throw new BadRequestException({
        message: `You tried too much,please try again after ${Math.floor(ttlKey / 60)} minutes`,
      });
    } return true;
  }

  async checkIfTemporaryBlockedUserEmail(email: string) {
    const key = `temporary_blocked_user_email:${email}`;
    const data = await this.redisService.getKey(key);
    if (data) {
      const ttlKey = await this.redisService.getTTl(key);
      throw new BadRequestException({
        message: `You tried too much,please try again after ${Math.floor(ttlKey / 60)} minutes`,
      });
    }
  }

  async delOtpAttempts(key: string) {
    await this.redisService.delOtp(key);
  }
}
