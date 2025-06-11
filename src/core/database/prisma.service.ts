import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    try {
      await this.prisma.$connect();
      console.log('Prisma connected');
    } catch (error) {
      console.error(error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.prisma.$disconnect();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}
