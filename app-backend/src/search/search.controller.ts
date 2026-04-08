// In search/search.controller.ts

import {
  Controller,
  Get,
  Query,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { UsersService } from '@/users/users.service';
import { GenderPreference } from '@/schemas/users.schema';

interface RequestingUser {
  userId: string;
  gender?: string;
  genderPreference?: GenderPreference;
}

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly usersService: UsersService,
  ) {}

  private async getRequestingUser(
    req: any,
  ): Promise<RequestingUser | undefined> {
    if (!req.user?.userId) {
      return undefined;
    }
    try {
      const user = await this.usersService.findById(req.user.userId);
      if (!user) return undefined;
      return {
        userId: user._id.toString(),
        gender: user.gender,
        genderPreference: user.genderPreference,
      };
    } catch (error) {
      console.error('Error fetching requesting user for search:', error);
      return undefined;
    }
  }

  @Get()
  async search(
    @Query('q') query: string,
    @Request() req,
    @Query('category') category?: string,
  ) {
    if ((!query || query.length < 2) && (!category || category === 'all')) {
      throw new BadRequestException(
        'Search query must be at least 2 characters or a category must be specified',
      );
    }

    const requestingUser = await this.getRequestingUser(req);

    const results = await this.searchService.search(
      query,
      category,
      requestingUser,
    );
    return results;
  }

  @Get('creator')
  async searchCreator(
    @Query('q') query: string,
    @Request() req,
    @Query('category') category?: string,
  ) {
    if ((!query || query.length < 2) && (!category || category === 'all')) {
      throw new BadRequestException(
        'Search query must be at least 2 characters or a category must be specified',
      );
    }

    const requestingUser = await this.getRequestingUser(req);

    const creators = await this.searchService.searchCreators(
      query,
      category,
      requestingUser,
    );
    return { creators };
  }

  @Get('posts')
  async searchPosts(
    @Query('q') query: string,
    @Query('category') category?: string,
  ) {
    if (!query || query.length < 2) {
      throw new BadRequestException(
        'Search query must be at least 2 characters',
      );
    }

    const posts = await this.searchService.searchPosts(query, category);
    return { posts };
  }
}
