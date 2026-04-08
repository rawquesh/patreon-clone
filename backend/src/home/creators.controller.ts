import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HomeService } from './home.service';
import { UsersService } from '@/users/users.service';
import { GenderPreference } from '@/schemas/users.schema';
import { OptionalJwtAuthGuard } from '@/auth/optional-auth-guard';

interface RequestingUser {
  userId: string;
  gender?: string;
  genderPreference?: GenderPreference;
}

@Controller('creators')
export class CreatorsController {
  constructor(
    private readonly homeService: HomeService,
    private readonly usersService: UsersService,
  ) {}

  private async getRequestingUser(
    req: any,
  ): Promise<RequestingUser | undefined> {
    console.log(req.user);
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
      console.error('Error fetching requesting user:', error);
      return undefined;
    }
  }

  @Get('top')
  @UseGuards(OptionalJwtAuthGuard)
  async getTopCreators(@Request() req, @Query('limit') limit?: number) {
    const requestingUser = await this.getRequestingUser(req);
    console.log(requestingUser);
    return this.homeService.getTopCreators(limit || 10, requestingUser);
  }

  @Get('popular-this-week')
  @UseGuards(OptionalJwtAuthGuard)
  async getPopularThisWeek(@Request() req, @Query('limit') limit?: number) {
    const requestingUser = await this.getRequestingUser(req);
    return this.homeService.getPopularThisWeek(limit || 10, requestingUser);
  }

  @Get('top-by-category/:category')
  @UseGuards(OptionalJwtAuthGuard)
  async getTopCreatorsByCategory(
    @Request() req,
    @Param('category') category: string,
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
      console.warn('Unauthenticated access to recently-visited creators.');
      return [];
    }
    return this.homeService.getRecentlyVisitedCreators(
      req.user.userId,
      limit || 10,
      requestingUser,
    );
  }

  @Get('feed/subscribed')
  @UseGuards(AuthGuard('jwt'))
  async getSubscribedFeed(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // const requestingUser = await this.getRequestingUser(req); // No longer needed for this call
    // if (!requestingUser) {
    //     throw new NotFoundException('User context required for subscribed feed');
    // }
    // Ensure user ID exists from AuthGuard
    if (!req.user?.userId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.homeService.getSubscribedFeed(
      req.user.userId,
      page || 1,
      limit || 10,
      // requestingUser // Removed argument
    );
  }
}
