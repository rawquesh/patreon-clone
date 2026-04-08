"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const home_controller_1 = require("./home.controller");
const home_service_1 = require("./home.service");
const user_1 = require("../database/schemas/user");
const post_1 = require("../database/schemas/post");
const subscription_1 = require("../database/schemas/subscription");
const creators_controller_1 = require("./creators.controller");
const users_module_1 = require("../users/users.module");
const categories_controller_1 = require("./categories.controller");
const posts_module_1 = require("../posts/posts.module");
const memberships_module_1 = require("../memberships/memberships.module");
let HomeModule = class HomeModule {
};
exports.HomeModule = HomeModule;
exports.HomeModule = HomeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_1.User.name, schema: user_1.UserSchema },
                { name: post_1.Post.name, schema: post_1.PostSchema },
                { name: subscription_1.Subscription.name, schema: subscription_1.SubscriptionSchema },
            ]),
            users_module_1.UsersModule,
            posts_module_1.PostsModule,
            memberships_module_1.MembershipsModule,
        ],
        controllers: [home_controller_1.HomeController, creators_controller_1.CreatorsController, categories_controller_1.CategoriesController],
        providers: [home_service_1.HomeService],
        exports: [home_service_1.HomeService],
    })
], HomeModule);
//# sourceMappingURL=home.module.js.map