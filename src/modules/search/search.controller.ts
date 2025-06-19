import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { SearchService } from './search.service';

@UseGuards(AuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async searchEverything(
    @Query('q') query: string,
    @Query('type') type = 'all',
    @Query('limit') limit = '20',
    @Query('page') page = '1',
    @Query('sort') sort = 'relevance',
    @Query('duration') duration = 'any',
    @Query('uploaded') uploaded = 'anytime',
  ) {
    try {
      return await this.searchService.search(
        query,
        type,
        +limit,
        +page,
        sort,
        duration,
        uploaded,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('suggestions')
  async getSuggestions(@Query('q') query: string) {
    try {
      return await this.searchService.getSuggestions(query);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('recommendations')
  async getRecommendations(
    @Query('limit') limit = '20',
    @Query('page') page = '1',
    @Query('videoId') videoId: string,
  ) {
    try {
      return await this.searchService.getRecommendations(
        +limit,
        +page,
        videoId,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
