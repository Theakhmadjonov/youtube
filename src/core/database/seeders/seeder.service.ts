import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);
  constructor(
    private readonly db: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async seedAll() {
    this.seedUsers();
  }
  async seedUsers() {
    this.logger.log('Users seeders started');
    const email = this.configService.get('ADMIN_EMAIL') as string;
    const username = this.configService.get('ADMIN_USERNAME') as string;
    const phone = this.configService.get('ADMIN_PHONE') as string;
    const firstName = this.configService.get('ADMIN_FIRSTNAME') as string;
    const lastName = this.configService.get('ADMIN_LASTNAME') as string;
    const password = this.configService.get('ADMIN_PASSWORD') as string;
    const findExistAdmin = await this.db.prisma.user.findFirst({
      where: { username },
    });
    if (!findExistAdmin) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await this.db.prisma.user.create({
        data: {
          email,
          username,
          phone,
          firstName,
          password: hashedPassword,
          lastName,
          role: 'SUPERADMIN',
          isEmailVerified: true,
        },
      });
      this.logger.log('Users seeders ended');
    } else {
      this.logger.log('Superadmin already existed');
    }
  }

  async onModuleInit() {
    try {
      await this.seedAll();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
