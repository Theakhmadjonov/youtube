import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsUrl,
  Min,
  MaxLength,
} from 'class-validator';
import { Category, VideoStatus, Visibility } from '@prisma/client';

export class CreateVideoDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @IsUrl()
  videoUrl: string;

  @IsInt()
  @Min(1)
  duration: number;

  @IsOptional()
  @IsEnum(VideoStatus)
  status?: VideoStatus;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @IsString()
  authorId: string;

  @IsOptional()
  @IsEnum(Category)
  category?: Category;
}

export class UpdateVideoDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(VideoStatus)
  status?: VideoStatus;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @IsOptional()
  @IsEnum(Category)
  category?: Category;
}
