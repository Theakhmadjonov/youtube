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
import { UpdateCommentDto } from './dto/update-comment.dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
