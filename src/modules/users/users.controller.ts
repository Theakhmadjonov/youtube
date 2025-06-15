import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('user/send-email-link')
  @HttpCode(200)
  async sendEmailVerificationLink(@Body() data: { email: string }) {
    return await this.usersService.sendEmailVerificationLink(data.email);
  }

  @Get('user/verify-email-link')
  async verifyEmailLink(@Query() token: string) {
    try {
      return await this.usersService.verifyUserEmail(token);
    } catch (error) {}
  }
}
