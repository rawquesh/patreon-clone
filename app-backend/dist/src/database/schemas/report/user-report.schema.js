"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserReportSchema = exports.UserReport = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const enums_1 = require("./enums");
let UserReport = class UserReport extends mongoose_2.Document {
};
exports.UserReport = UserReport;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], UserReport.prototype, "reportedUser", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], UserReport.prototype, "reportedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: enums_1.UserReportReason, required: true }),
    __metadata("design:type", String)
], UserReport.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserReport.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: enums_1.ReportStatus, default: enums_1.ReportStatus.PENDING }),
    __metadata("design:type", String)
], UserReport.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserReport.prototype, "adminNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], UserReport.prototype, "reviewedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], UserReport.prototype, "reviewedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserReport.prototype, "additionalContext", void 0);
exports.UserReport = UserReport = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    })
], UserReport);
exports.UserReportSchema = mongoose_1.SchemaFactory.createForClass(UserReport);
exports.UserReportSchema.index({ reportedUser: 1 });
exports.UserReportSchema.index({ reportedBy: 1 });
exports.UserReportSchema.index({ status: 1 });
exports.UserReportSchema.index({ createdAt: -1 });
exports.UserReportSchema.index({ reportedUser: 1, reportedBy: 1 }, { unique: true });
//# sourceMappingURL=user-report.schema.js.map