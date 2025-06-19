import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Request } from 'express';

@UseGuards(AuthGuard)
@UseGuards(RoleGuard)
@SetMetadata('roles', ['superadmin'])
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async adminDashboard(@Req() req: Request) {
    try {
      const userId = req['userId'];
      return await this.adminService.adminDashboard(userId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
