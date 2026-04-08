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
exports.PostReportSchema = exports.PostReport = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const enums_1 = require("./enums");
let PostReport = class PostReport extends mongoose_2.Document {
};
exports.PostReport = PostReport;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Post', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], PostReport.prototype, "post", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], PostReport.prototype, "reportedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: enums_1.ReportReason, required: true }),
    __metadata("design:type", String)
], PostReport.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PostReport.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: enums_1.ReportStatus, default: enums_1.ReportStatus.PENDING }),
    __metadata("design:type", String)
], PostReport.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PostReport.prototype, "adminNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], PostReport.prototype, "reviewedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], PostReport.prototype, "reviewedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PostReport.prototype, "additionalContext", void 0);
exports.PostReport = PostReport = __decorate([
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
], PostReport);
exports.PostReportSchema = mongoose_1.SchemaFactory.createForClass(PostReport);
exports.PostReportSchema.index({ post: 1 });
exports.PostReportSchema.index({ reportedBy: 1 });
exports.PostReportSchema.index({ status: 1 });
exports.PostReportSchema.index({ createdAt: -1 });
exports.PostReportSchema.index({ post: 1, reportedBy: 1 }, { unique: true });
//# sourceMappingURL=post-report.schema.js.map