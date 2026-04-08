"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const users_controller_1 = require("./users.controller");
const users_service_1 = require("./users.service");
const user_1 = require("../database/schemas/user");
const s3_module_1 = require("../s3/s3.module");
const payments_module_1 = require("../payments/payments.module");
const memberships_module_1 = require("../memberships/memberships.module");
const membership_1 = require("../database/schemas/membership");
const subscription_1 = require("../database/schemas/subscription");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_1.User.name, schema: user_1.UserSchema },
                {
                    name: membership_1.Membership.name,
                    schema: membership_1.MembershipSchema,
                },
                {
                    name: subscription_1.Subscription.name,
                    schema: subscription_1.SubscriptionSchema,
                },
            ]),
            s3_module_1.S3Module,
            payments_module_1.PaymentsModule,
            memberships_module_1.MembershipsModule,
        ],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map