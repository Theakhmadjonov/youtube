import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailService } from '../auth/email-otp.service';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private email: EmailService,
    private db: PrismaService,
  ) {}
  async sendEmailVerificationLink(email: string) {
    const existedEmail = await this.db.prisma.user.findFirst({
      where: { email },
    });
    if (!existedEmail) throw new BadRequestException('Email not found');
    await this.email.sendLinkEmail(email);
    return {
      message: 'Link sended',
    };
  }

  async verifyUserEmail(token: string) {
    const data = await this.email.getEmailToken(token);
    const res = JSON.parse(data as string);
    const user = await this.db.prisma.user.findFirst({
      where: { email: res.email },
    });
    await this.db.prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        isEmailVerified: true,
      },
    });
    return {
      message: 'Your email verified',
    };
  }
}
