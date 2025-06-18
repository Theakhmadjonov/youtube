import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class CommentService {
  constructor(private db: PrismaService) {}
  async create(content: string, userId: string, videoId: string) {
    const findVideo = await this.db.prisma.comment.findFirst({
      where: { id: videoId },
    });
    if (!findVideo) throw new NotFoundException('Video not found');
    const comment = await this.db.prisma.comment.create({
      data: {
        content,
        authorId: userId,
        videoId: videoId,
      },
    });
    return { comment };
  }

  async getComment(
    videoId: string,
    limit: number = 20,
    page: number = 1,
    sort: string,
  ) {
    if (sort === 'top') {
      const comment = await this.db.prisma.comment.findMany({
        where: { id: videoId },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'asc' },
        select: {
          _count: true,
          author: true,
          content: true,
          createdAt: true,
          isPinned: true,
          likes: true,
          likesCount: true,
          video: true,
        },
      });
      return comment;
    } else {
      const comment = await this.db.prisma.comment.findMany({
        where: { id: videoId },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        select: {
          _count: true,
          author: true,
          content: true,
          createdAt: true,
          isPinned: true,
          likes: true,
          likesCount: true,
          video: true,
        },
      });
      return comment;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
