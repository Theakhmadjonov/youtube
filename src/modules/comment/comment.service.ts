import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { LikeType } from '@prisma/client';

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

  async addLike(userId: string, commentId: string) {
    const existComment = await this.db.prisma.comment.findFirst({ where: { id: commentId } });
    if (!existComment) throw new NotFoundException('Comment not found');
       await this.db.prisma.like.deleteMany({
      where: {
        userId,
        commentId,
        type: LikeType.DISLIKE,
      },
    });
    const addedLIke = await this.db.prisma.like.upsert({
      where: {
        userId_commentId_type: {
          userId,
          commentId,
          type: LikeType.LIKE,
        },
      },
      update: {},
      create: {
        userId,
        commentId,
        type: LikeType.LIKE,
      },
    });
    return addedLIke;
  }

  async addDisLike(userId: string, commentId: string) {
    const existComment = await this.db.prisma.comment.findFirst({ where: { id: commentId } });
    if (!existComment) throw new NotFoundException('Comment not found');
       await this.db.prisma.like.deleteMany({
      where: {
        userId,
        commentId,
        type: LikeType.LIKE,
      },
    });
    const addedDisLIke = await this.db.prisma.like.upsert({
      where: {
        userId_commentId_type: {
          userId,
          commentId,
          type: LikeType.DISLIKE,
        },
      },
      update: {},
      create: {
        userId,
        commentId,
        type: LikeType.DISLIKE,
      },
    });
    return addedDisLIke;
  }

  async deleteLike(userId: string, commentId: string) {
    const existComment = await this.db.prisma.comment.findFirst({ where: { id: commentId } });
    if (!existComment) throw new NotFoundException('Comment not found');
       await this.db.prisma.like.deleteMany({
      where: {
        userId,
        commentId,
        type: LikeType.LIKE,
      },
    });
  }

   async togglePin(commentId: string, userId: string) {
    const comment = await this.db.prisma.comment.findUnique({
      where: { id: commentId },
      include: { video: true },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.video.authorId !== userId) {
      throw new Error('Only video author can pin this comment');
    }

    const updated = await this.db.prisma.comment.update({
      where: { id: commentId },
      data: { isPinned: !comment.isPinned },
    });

    return {
      message: updated.isPinned ? 'Comment pinned' : 'Comment unpinned',
    };
  }
}
