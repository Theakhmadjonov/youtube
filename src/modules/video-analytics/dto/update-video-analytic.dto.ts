import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoAnalyticDto } from './create-video-analytic.dto';

export class UpdateVideoAnalyticDto extends PartialType(CreateVideoAnalyticDto) {}
