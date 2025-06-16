import { IsOptional, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  channelName: string;

  @IsOptional()
  @IsString()
  channelDescription?: string;

  @IsOptional()
  @IsString()
  channelBanner?: string;
}
