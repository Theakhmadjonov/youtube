import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  public redis: Redis;
  private duration: number = 60 * 10;
  constructor() {
    this.redis = new Redis({
      port: +(process.env.REDIS_PORT as string),
      host: process.env.REDIS_HOST as string,
    });
    this.redis.on('connect', () => {
      console.log('Redis connected');
    });
    this.redis.on('error', () => {
      console.log('Redis connection error');
      this.redis.quit();
      process.exit(1);
    });
  }

  async setOtp(phone: string, otp: string): Promise<string> {
    const key = `user:${phone}`;
    const res = await this.redis.setex(key, this.duration, otp);
    return res;
  }

  async getOtp(key: string) {
    const otp = await this.redis.get(key);
    return otp;
  }

  async getTTl(key: string) {
    const ttl = await this.redis.ttl(key);
    return ttl;
  }

  async delOtp(key: string) {
    await this.redis.del(key);
  }

  async setSessionTokenUser(phone: string, token: string) {
    await this.redis.setex(`session:${phone}`, 300, token);
  }

  async getKey(key: string) {
    const otp = await this.redis.get(key);
    return otp;
  }
}
