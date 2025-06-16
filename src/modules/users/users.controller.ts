import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { sendOtpEmail, verifyOtpEmail } from './dto/create-user.dto';
import { Request } from 'express';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('user/send-email-link')
  @HttpCode(200)
  async sendEmailVerificationLink(@Body() data: { email: string }) {
    try {
      return await this.usersService.sendEmailVerificationLink(data.email);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('user/verify-email-link')
  async verifyEmailLink(@Query() token: string) {
    try {
      return await this.usersService.verifyUserEmail(token);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('send-otp-email')
  async sendOtpToEmail(@Body() email: string, @Req() req: Request) {
    try {
      const userId = req['userId'];
      return await this.usersService.sendOtpEmail(userId, email);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-otp-email')
  async verifyOtpEmail(@Body() data: verifyOtpEmail, @Req() req: Request) {
    try {
      const userId = req['userId'];
      return await this.usersService.verifyUserCodeEmail(data, userId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
