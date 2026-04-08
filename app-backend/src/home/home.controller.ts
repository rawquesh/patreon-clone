import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HomeService } from './home.service';
import { UsersService } from '@/users/users.service';
import { GenderPreference } from '@/schemas/users.schema';

interface RequestingUser {
  userId: string;
  gender?: string;
  genderPreference?: GenderPreference;
}

@Controller('home')
export class HomeController {
  constructor(
    private readonly homeService: HomeService,
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
      console.error('Error fetching requesting user for home:', error);
      return undefined;
    }
  }

  @Get('top-creators')
  async getTopCreators(@Request() req, @Query('limit') limit?: number) {
    const requestingUser = await this.getRequestingUser(req);
    return this.homeService.getTopCreators(limit || 10, requestingUser);
  }

  @Get('popular-this-week')
  async getPopularThisWeek(@Request() req, @Query('limit') limit?: number) {
    const requestingUser = await this.getRequestingUser(req);
    return this.homeService.getPopularThisWeek(limit || 10, requestingUser);
  }

  @Get('categories')
  async getCategories() {
    return this.homeService.getCategories();
  }

  @Get('top-by-category')
  async getTopCreatorsByCategory(
    @Query('category') category: string,
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    const requestingUser = await this.getRequestingUser(req);
    return this.homeService.getTopCreatorsByCategory(
      category,
      limit || 10,
      requestingUser,
    );
  }

  @Get('recently-visited')
  async getRecentlyVisitedCreators(
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    const requestingUser = await this.getRequestingUser(req);
    if (!requestingUser) {
      console.warn('Unauthenticated access to /home/recently-visited');
      return [];
    }
    return this.homeService.getRecentlyVisitedCreators(
      req.user.userId,
      limit || 10,
      requestingUser,
    );
  }

  @Get('recently-visited-public')
  async getRecentlyVisitedCreatorsPublic(
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    const genderPreference =
      req.user?.genderPreference || GenderPreference.BOTH;
    return this.homeService.getRecentlyVisitedCreators(
      undefined,
      limit || 10,
      genderPreference,
    );
  }

  @Get('subscribed-feed')
  @UseGuards(AuthGuard('jwt'))
  async getSubscribedFeed(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // const requestingUser = await this.getRequestingUser(req); // No longer needed for this call
    // if (!requestingUser) {
    //    throw new BadRequestException('User context required for subscribed feed');
    // }
    // Ensure user ID exists from AuthGuard
    console.log('SUBSCRIBED FEED');
    if (!req.user?.userId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.homeService.getSubscribedFeed(
      req.user.userId,
      page || 1,
      limit || 10,
    );
  }
}
