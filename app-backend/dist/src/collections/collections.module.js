"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const collections_service_1 = require("./collections.service");
const collections_controller_1 = require("./collections.controller");
const s3_module_1 = require("../s3/s3.module");
const collections_schema_1 = require("./collections.schema");
const post_1 = require("../database/schemas/post");
const subscription_1 = require("../database/schemas/subscription");
const memberships_module_1 = require("../memberships/memberships.module");
let CollectionsModule = class CollectionsModule {
};
exports.CollectionsModule = CollectionsModule;
exports.CollectionsModule = CollectionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: collections_schema_1.Collection.name, schema: collections_schema_1.CollectionSchema },
                { name: post_1.Post.name, schema: post_1.PostSchema },
                { name: subscription_1.Subscription.name, schema: subscription_1.SubscriptionSchema },
            ]),
            s3_module_1.S3Module,
            memberships_module_1.MembershipsModule,
        ],
        providers: [collections_service_1.CollectionsService],
        controllers: [collections_controller_1.CollectionsController],
        exports: [collections_service_1.CollectionsService],
    })
], CollectionsModule);
//# sourceMappingURL=collections.module.js.map