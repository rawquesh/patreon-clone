"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const admin_guard_1 = require("./admin.guard");
const post_report_schema_1 = require("../../database/schemas/report/post-report.schema");
const user_report_schema_1 = require("../../database/schemas/report/user-report.schema");
const withheld_schema_1 = require("../../database/schemas/report/withheld.schema");
const post_1 = require("../../database/schemas/post");
const user_1 = require("../../database/schemas/user");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: post_report_schema_1.PostReport.name, schema: post_report_schema_1.PostReportSchema },
                { name: user_report_schema_1.UserReport.name, schema: user_report_schema_1.UserReportSchema },
                { name: withheld_schema_1.WithheldPost.name, schema: withheld_schema_1.WithheldPostSchema },
                { name: withheld_schema_1.WithheldUser.name, schema: withheld_schema_1.WithheldUserSchema },
                { name: post_1.Post.name, schema: post_1.PostSchema },
                { name: user_1.User.name, schema: user_1.UserSchema },
            ]),
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService, admin_guard_1.AdminGuard],
        exports: [admin_service_1.AdminService, admin_guard_1.AdminGuard],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map