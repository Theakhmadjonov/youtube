import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { EmailService } from '../auth/email-otp.service';
import { OtpService } from '../auth/otp.service';
import {
  verifyOtpEmail
} from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private email: EmailService,
    private db: PrismaService,
    private otp: OtpService,
  ) {}

  async sendEmailVerificationLink(email: string) {
    try {
      const existedEmail = await this.db.prisma.user.findFirst({
        where: { email },
      });
      if (!existedEmail) throw new BadRequestException('Email not found');
      await this.email.sendLinkEmail(email);
      return {
        message: 'Link sended',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async verifyUserEmail(token: string) {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async sendOtpEmail(userId: string, email: string) {
    try {
      const existUser = await this.db.prisma.user.findFirst({
        where: { id: userId },
      });
      if (!existUser) throw new NotFoundException('User not found');
      const res = await this.otp.sendOtpToEmail(email);
      if (!res) throw new InternalServerErrorException('Server error');
      return {
        message: `Code sended to your ${email} email`,
      };
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async verifyUserCodeEmail(data: verifyOtpEmail, userId: string) {
    try {
      const key = `user_email:${data.email}`;
      await this.otp.verifyOtpSendedCodeEmail(key, data.code, data.email);
      const verifyedUserEmail = await this.db.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isEmailVerified: true,
        },
      });
      return {
        message: 'success',
        statusCode: 200,
        verifyedUserEmail,
      };
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
