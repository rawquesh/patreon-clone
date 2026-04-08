"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksModule = void 0;
const memberships_module_1 = require("../memberships/memberships.module");
const payments_module_1 = require("../payments/payments.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_webhooks_controller_1 = require("./stripe-webhooks.controller");
const chat_module_1 = require("../chat/chat.module");
const users_module_1 = require("../users/users.module");
let WebhooksModule = class WebhooksModule {
};
exports.WebhooksModule = WebhooksModule;
exports.WebhooksModule = WebhooksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            memberships_module_1.MembershipsModule,
            payments_module_1.PaymentsModule,
            config_1.ConfigModule,
            chat_module_1.ChatModule,
            users_module_1.UsersModule,
        ],
        controllers: [stripe_webhooks_controller_1.StripeWebhookController],
    })
], WebhooksModule);
//# sourceMappingURL=webhooks.module.js.map