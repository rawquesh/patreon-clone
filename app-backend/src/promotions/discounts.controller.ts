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
import {
  CreateDiscountDto,
  RedeemPromotionDto,
  UpdateDiscountDto,
} from './promotions.dto';

@Controller('promotions/discounts')
export class DiscountsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createDiscount(
    @Request() req,
    @Body(new ValidationPipe()) createDiscountDto: CreateDiscountDto,
  ) {
    return this.promotionsService.createDiscount(
      req.user.userId,
      createDiscountDto,
    );
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getDiscounts(@Request() req) {
    return {
      discounts: await this.promotionsService.getDiscounts(req.user.userId),
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getDiscount(@Request() req, @Param('id') id: string) {
    return this.promotionsService.getDiscount(req.user.userId, id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateDiscount(
    @Request() req,
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateDiscountDto: UpdateDiscountDto,
  ) {
    return this.promotionsService.updateDiscount(
      req.user.userId,
      id,
      updateDiscountDto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteDiscount(@Request() req, @Param('id') id: string) {
    return this.promotionsService.deleteDiscount(req.user.userId, id);
  }

  @Post('generate-code')
  @UseGuards(AuthGuard('jwt'))
  async generateCode() {
    return {
      code: this.promotionsService.generateRandomCode(),
    };
  }

  @Post('validate')
  async validatePromotion(@Body('code') code: string) {
    return this.promotionsService.validatePromotion(code);
  }

  @Post('redeem')
  @UseGuards(AuthGuard('jwt'))
  async redeemPromotion(
    @Request() req,
    @Body(new ValidationPipe()) redeemDto: RedeemPromotionDto,
  ) {
    return this.promotionsService.redeemPromotion(req.user.userId, redeemDto);
  }
}
