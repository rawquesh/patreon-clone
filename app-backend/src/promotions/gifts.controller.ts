import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PromotionsService } from './promotions.service';
import { CreateGiftDto, UpdateGiftDto } from './promotions.dto';

@Controller('promotions/gifts')
export class GiftsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createGift(
    @Request() req,
    @Body(new ValidationPipe()) createGiftDto: CreateGiftDto,
  ) {
    return this.promotionsService.createGift(req.user.userId, createGiftDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getGifts(@Request() req) {
    return {
      gifts: await this.promotionsService.getGifts(req.user.userId),
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getGift(@Request() req, @Param('id') id: string) {
    return this.promotionsService.getGift(req.user.userId, id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateGift(
    @Request() req,
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateGiftDto: UpdateGiftDto,
  ) {
    return this.promotionsService.updateGift(
      req.user.userId,
      id,
      updateGiftDto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteGift(@Request() req, @Param('id') id: string) {
    return this.promotionsService.deleteGift(req.user.userId, id);
  }

  @Post('generate-code')
  @UseGuards(AuthGuard('jwt'))
  async generateCode() {
    return {
      code: this.promotionsService.generateRandomCode(),
    };
  }
}
