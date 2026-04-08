import { HomeService } from './home.service';
export declare class CategoriesController {
    private readonly homeService;
    constructor(homeService: HomeService);
    getCategories(): Promise<string[]>;
}
