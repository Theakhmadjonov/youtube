import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CommentService } from './comment.service';

@UseGuards(AuthGuard)
@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('videos/:videoId/comments')
  async create(
    @Body() content: string,
    @Param('videoId') videoId: string,
    @Req() req: Request,
  ) {
    try {
      const userId = req['userId'];
      return await this.commentService.create(content, userId, videoId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('videos/:videoId/comments')
  async getComment(
    @Param('videoId') videoId: string,
    @Req() req: Request,
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Query('sort') sort: string,
  ) {
    try {
      const userId = req['userId'];
      return await this.commentService.getComment(videoId, +limit, +page, sort);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('comments/:id/like')
  async addLike(@Param('id') commentId: string, @Req() req: Request) {
    try {
      const userId = req['userId'];
      return await this.commentService.addLike(userId, commentId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('comments/:id/dislike')
  async addDisLike(@Param('id') commentId: string, @Req() req: Request) {
    try {
      const userId = req['userId'];
      return await this.commentService.addDisLike(userId, commentId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('comments/:id/like')
  async RemoveLike(@Param('id') commentId: string, @Req() req: Request) {
    try {
      const userId = req['userId'];
      return await this.commentService.deleteLike(userId, commentId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('comments/:id/pin')
  async togglePin(@Param('id') commentId: string, @Req() req: Request) {
    try {
      const userId = req['userId'];
      return await this.commentService.togglePin(userId, commentId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
