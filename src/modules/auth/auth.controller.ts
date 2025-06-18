import {
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Body,
  Res,
  Get,
  Req,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, RegisterDto, verifyOtp } from './dto/create-auth.dto';
import { Request, Response } from 'express';
import { sendCodeLoginDto, verifyCodeLoginDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body() createAuthDto: CreateAuthDto) {
    try {
      const response = await this.authService.sendOtp(createAuthDto);
      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data: verifyOtp) {
    try {
      const response = await this.authService.verifyOtp(data);
      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('register')
  async register(
    @Body() data: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const token = await this.authService.register(data);
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 1.1 * 3600 * 1000,
      });
      return { token };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('send-code-login')
  async sendCodeLogin(@Body() data: sendCodeLoginDto) {
    try {
      const response = await this.authService.sendCodeLogin(data);
      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-login')
  async verifyLogin(
    @Body() data: verifyCodeLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const token = await this.authService.verifyCodeLogin(data);
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 1.1 * 3600 * 1000,
      });
      return { token };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('users/me')
  async getMe(@Req() req: Request) {
    try {
      const userId = req['userId'];
      return await this.authService.getMe(userId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('/users/me')
  async updatedUserInfo(@Body() data: UpdateAuthDto, @Req() req: Request) {
    try {
      const userId = req['userId'];
      return await this.authService.updatedUSerProfile(data, userId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
