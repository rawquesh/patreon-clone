import { Controller, Get } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  async getCategories() {
    console.log('getCategories called');
    return this.homeService.getCategories();
  }
}
