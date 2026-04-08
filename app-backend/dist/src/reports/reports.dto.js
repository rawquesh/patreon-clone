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
exports.RestoreUserDto = exports.RestorePostDto = exports.WithholdUserDto = exports.WithholdPostDto = exports.GetUserReportsQueryDto = exports.GetReportsQueryDto = exports.SortOrder = exports.ReportSortBy = exports.UpdateUserReportStatusDto = exports.UpdateReportStatusDto = exports.CreateUserReportDto = exports.CreatePostReportDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const enums_1 = require("../database/schemas/report/enums");
class CreatePostReportDto {
}
exports.CreatePostReportDto = CreatePostReportDto;
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'Invalid post ID' }),
    __metadata("design:type", String)
], CreatePostReportDto.prototype, "postId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.ReportReason, {
        message: 'Invalid report reason',
    }),
    __metadata("design:type", String)
], CreatePostReportDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, {
        message: 'Description must be at least 10 characters long',
    }),
    (0, class_validator_1.MaxLength)(1000, {
        message: 'Description must not exceed 1000 characters',
    }),
    __metadata("design:type", String)
], CreatePostReportDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500, {
        message: 'Additional context must not exceed 500 characters',
    }),
    __metadata("design:type", String)
], CreatePostReportDto.prototype, "additionalContext", void 0);
class CreateUserReportDto {
}
exports.CreateUserReportDto = CreateUserReportDto;
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'Invalid user ID' }),
    __metadata("design:type", String)
], CreateUserReportDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.UserReportReason, {
        message: 'Invalid report reason',
    }),
    __metadata("design:type", String)
], CreateUserReportDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, {
        message: 'Description must be at least 10 characters long',
    }),
    (0, class_validator_1.MaxLength)(1000, {
        message: 'Description must not exceed 1000 characters',
    }),
    __metadata("design:type", String)
], CreateUserReportDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500, {
        message: 'Additional context must not exceed 500 characters',
    }),
    __metadata("design:type", String)
], CreateUserReportDto.prototype, "additionalContext", void 0);
class UpdateReportStatusDto {
}
exports.UpdateReportStatusDto = UpdateReportStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.ReportStatus, {
        message: 'Invalid report status',
    }),
    __metadata("design:type", String)
], UpdateReportStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, {
        message: 'Admin notes must not exceed 1000 characters',
    }),
    __metadata("design:type", String)
], UpdateReportStatusDto.prototype, "adminNotes", void 0);
class UpdateUserReportStatusDto {
}
exports.UpdateUserReportStatusDto = UpdateUserReportStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.ReportStatus, {
        message: 'Invalid report status',
    }),
    __metadata("design:type", String)
], UpdateUserReportStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, {
        message: 'Admin notes must not exceed 1000 characters',
    }),
    __metadata("design:type", String)
], UpdateUserReportStatusDto.prototype, "adminNotes", void 0);
var ReportSortBy;
(function (ReportSortBy) {
    ReportSortBy["CREATED_AT"] = "createdAt";
    ReportSortBy["UPDATED_AT"] = "updatedAt";
    ReportSortBy["STATUS"] = "status";
})(ReportSortBy || (exports.ReportSortBy = ReportSortBy = {}));
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
class GetReportsQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = ReportSortBy.CREATED_AT;
        this.sortOrder = SortOrder.DESC;
    }
}
exports.GetReportsQueryDto = GetReportsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GetReportsQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GetReportsQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ReportSortBy),
    __metadata("design:type", String)
], GetReportsQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortOrder),
    __metadata("design:type", String)
], GetReportsQueryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.ReportStatus),
    __metadata("design:type", String)
], GetReportsQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], GetReportsQueryDto.prototype, "reportedBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], GetReportsQueryDto.prototype, "postId", void 0);
class GetUserReportsQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = ReportSortBy.CREATED_AT;
        this.sortOrder = SortOrder.DESC;
    }
}
exports.GetUserReportsQueryDto = GetUserReportsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GetUserReportsQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GetUserReportsQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ReportSortBy),
    __metadata("design:type", String)
], GetUserReportsQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortOrder),
    __metadata("design:type", String)
], GetUserReportsQueryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.ReportStatus),
    __metadata("design:type", String)
], GetUserReportsQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], GetUserReportsQueryDto.prototype, "reportedBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], GetUserReportsQueryDto.prototype, "userId", void 0);
class WithholdPostDto {
}
exports.WithholdPostDto = WithholdPostDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, {
        message: 'Reason must be at least 10 characters long',
    }),
    (0, class_validator_1.MaxLength)(500, {
        message: 'Reason must not exceed 500 characters',
    }),
    __metadata("design:type", String)
], WithholdPostDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, {
        message: 'Admin notes must not exceed 1000 characters',
    }),
    __metadata("design:type", String)
], WithholdPostDto.prototype, "adminNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], WithholdPostDto.prototype, "relatedReportId", void 0);
class WithholdUserDto {
}
exports.WithholdUserDto = WithholdUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, {
        message: 'Reason must be at least 10 characters long',
    }),
    (0, class_validator_1.MaxLength)(500, {
        message: 'Reason must not exceed 500 characters',
    }),
    __metadata("design:type", String)
], WithholdUserDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, {
        message: 'Admin notes must not exceed 1000 characters',
    }),
    __metadata("design:type", String)
], WithholdUserDto.prototype, "adminNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], WithholdUserDto.prototype, "relatedReportId", void 0);
class RestorePostDto {
}
exports.RestorePostDto = RestorePostDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500, {
        message: 'Restoration notes must not exceed 500 characters',
    }),
    __metadata("design:type", String)
], RestorePostDto.prototype, "restorationNotes", void 0);
class RestoreUserDto {
}
exports.RestoreUserDto = RestoreUserDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500, {
        message: 'Restoration notes must not exceed 500 characters',
    }),
    __metadata("design:type", String)
], RestoreUserDto.prototype, "restorationNotes", void 0);
//# sourceMappingURL=reports.dto.js.map