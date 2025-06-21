import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsUrl,
  Min,
  MaxLength,
} from 'class-validator';
// import { Category, VideoStatus, Visibility } from '@prisma/client';

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
  status?: string;

  @IsOptional()
  visibility?: string;

  @IsString()
  authorId: string;

  @IsOptional()
  category?: string;
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
  status?: string;

  @IsOptional()
  visibility?: string;

  @IsOptional()
  category?: string;
}
