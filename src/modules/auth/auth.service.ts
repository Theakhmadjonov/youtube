import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { PrismaService } from 'src/core/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto, RegisterDto, verifyOtp } from './dto/create-auth.dto';
import bcrypt from 'bcrypt';
import { sendCodeLoginDto, verifyCodeLoginDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private otp: OtpService,
    private db: PrismaService,
    private jwt: JwtService,
  ) {}

  async sendOtp(createAurhDto: CreateAuthDto) {
    try {
      const findUser = await this.db.prisma.user.findUnique({
        where: { phone: createAurhDto.phone },
      });
      if (findUser) throw new ConflictException('User alreday exists');
      const res = await this.otp.sendOtp(createAurhDto.phone);
      console.log(res);
      if (!res) throw new InternalServerErrorException('Server error');
      return {
        message: 'Code sended',
      };
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async verifyOtp(data: verifyOtp) {
    try {
      const key = `user:${data.phone}`;
      const sessionToken = await this.otp.verifyOtpSendedCode(
        key,
        data.code,
        data.phone,
      );
      return {
        message: 'success',
        statusCode: 200,
        sessionToken,
      };
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async register(data: RegisterDto) {
    try {
      const findUser = await this.db.prisma.user.findUnique({
        where: { phone: data.phone },
      });
      if (findUser) throw new ConflictException('User alreday exists');
      const key = `session:${data.phone}`;
      await this.otp.CheckTokenUSer(key, data.session_token);
      const hashedPassword = await bcrypt.hash(data.password, 12);
      const user = await this.db.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });
      const token = await this.jwt.signAsync({ userId: user.id });
      await this.otp.delTokenUser(key);
      return token;
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async sendCodeLogin(data: sendCodeLoginDto) {
    try {
      const findUser = await this.db.prisma.user.findUnique({
        where: { phone: data.phone },
      });
      if (!findUser) throw new ConflictException('User not found');
      const checkPassword = await bcrypt.compare(
        data.password,
        findUser.password,
      );
      if (!checkPassword) {
        throw new UnauthorizedException('Incorrect password');
      }
      const res = await this.otp.sendOtp(data.phone);
      console.log(res);
      if (!res) throw new InternalServerErrorException('Server error');
      return {
        message: 'Code sended',
      };
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async verifyCodeLogin(data: verifyCodeLoginDto) {
    try {
      const existedUser = await this.db.prisma.user.findUnique({ where: { phone: data.phone } });
      if (!existedUser) throw new BadRequestException('User not found');
      const key = `user:${data.phone}`;
      await this.otp.verifySendedCodeLogin(
        key,
        data.code,
      );
      const token = await this.jwt.signAsync({ userId: existedUser.id });
      await this.otp.delTokenUser(key);
      return token;
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
