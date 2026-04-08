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
exports.CommentsQueryDto = exports.FetchPostsDto = exports.DatePublishedFilter = exports.SortBy = exports.SortOrder = exports.UpdateLinkPostDto = exports.CreateLinkPostDto = exports.UpdateImagePostDto = exports.CreateImagePostDto = exports.UpdateAudioPostDto = exports.CreateAudioPostDto = exports.UpdateVideoPostDto = exports.CreateVideoPostDto = exports.UpdateTextPostDto = exports.CreateTextPostDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const post_1 = require("../database/schemas/post");
class CreateTextPostDto {
}
exports.CreateTextPostDto = CreateTextPostDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTextPostDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTextPostDto.prototype, "textContent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateTextPostDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateTextPostDto.prototype, "collections", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return false;
        }
    }),
    __metadata("design:type", Boolean)
], CreateTextPostDto.prototype, "isDraft", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateTextPostDto.prototype, "tierAccess", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateTextPostDto.prototype, "existingAttachments", void 0);
class UpdateTextPostDto extends CreateTextPostDto {
}
exports.UpdateTextPostDto = UpdateTextPostDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTextPostDto.prototype, "textContent", void 0);
class CreateVideoPostDto {
}
exports.CreateVideoPostDto = CreateVideoPostDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Invalid video URL' }),
    __metadata("design:type", String)
], CreateVideoPostDto.prototype, "videoUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVideoPostDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVideoPostDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateVideoPostDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateVideoPostDto.prototype, "collections", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateVideoPostDto.prototype, "tierAccess", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateVideoPostDto.prototype, "existingAttachments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return false;
        }
    }),
    __metadata("design:type", Boolean)
], CreateVideoPostDto.prototype, "isDraft", void 0);
class UpdateVideoPostDto extends CreateVideoPostDto {
}
exports.UpdateVideoPostDto = UpdateVideoPostDto;
class CreateAudioPostDto {
}
exports.CreateAudioPostDto = CreateAudioPostDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAudioPostDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAudioPostDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateAudioPostDto.prototype, "collections", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateAudioPostDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateAudioPostDto.prototype, "tierAccess", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateAudioPostDto.prototype, "existingAttachments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return false;
        }
    }),
    __metadata("design:type", Boolean)
], CreateAudioPostDto.prototype, "isDraft", void 0);
class UpdateAudioPostDto extends CreateAudioPostDto {
}
exports.UpdateAudioPostDto = UpdateAudioPostDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAudioPostDto.prototype, "existingAudioFileUrl", void 0);
class CreateImagePostDto {
}
exports.CreateImagePostDto = CreateImagePostDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImagePostDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateImagePostDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateImagePostDto.prototype, "collections", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateImagePostDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateImagePostDto.prototype, "tierAccess", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateImagePostDto.prototype, "existingAttachments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateImagePostDto.prototype, "existingImages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return false;
        }
    }),
    __metadata("design:type", Boolean)
], CreateImagePostDto.prototype, "isDraft", void 0);
class UpdateImagePostDto extends CreateImagePostDto {
}
exports.UpdateImagePostDto = UpdateImagePostDto;
class CreateLinkPostDto {
}
exports.CreateLinkPostDto = CreateLinkPostDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLinkPostDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Invalid link URL format' }),
    __metadata("design:type", String)
], CreateLinkPostDto.prototype, "linkUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLinkPostDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateLinkPostDto.prototype, "collections", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateLinkPostDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateLinkPostDto.prototype, "tierAccess", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    }),
    __metadata("design:type", Array)
], CreateLinkPostDto.prototype, "existingAttachments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch {
            return false;
        }
    }),
    __metadata("design:type", Boolean)
], CreateLinkPostDto.prototype, "isDraft", void 0);
class UpdateLinkPostDto extends CreateLinkPostDto {
}
exports.UpdateLinkPostDto = UpdateLinkPostDto;
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
var SortBy;
(function (SortBy) {
    SortBy["CREATED_AT"] = "createdAt";
    SortBy["TITLE"] = "title";
    SortBy["TYPE"] = "type";
})(SortBy || (exports.SortBy = SortBy = {}));
var DatePublishedFilter;
(function (DatePublishedFilter) {
    DatePublishedFilter["THIS_WEEK"] = "week";
    DatePublishedFilter["THIS_MONTH"] = "month";
    DatePublishedFilter["THIS_YEAR"] = "year";
    DatePublishedFilter["ALL_TIME"] = "All time";
})(DatePublishedFilter || (exports.DatePublishedFilter = DatePublishedFilter = {}));
class FetchPostsDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = SortBy.CREATED_AT;
        this.sortOrder = SortOrder.DESC;
    }
}
exports.FetchPostsDto = FetchPostsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FetchPostsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FetchPostsDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FetchPostsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortBy),
    __metadata("design:type", String)
], FetchPostsDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortOrder),
    __metadata("design:type", String)
], FetchPostsDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(post_1.PostType, { each: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return value ? [value] : undefined;
            }
        }
        return value;
    }),
    __metadata("design:type", Array)
], FetchPostsDto.prototype, "types", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FetchPostsDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return value ? [value] : undefined;
            }
        }
        return value;
    }),
    __metadata("design:type", Array)
], FetchPostsDto.prototype, "collections", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return value ? [value] : undefined;
            }
        }
        return value;
    }),
    __metadata("design:type", Array)
], FetchPostsDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return value ? [value] : undefined;
            }
        }
        return value;
    }),
    __metadata("design:type", Array)
], FetchPostsDto.prototype, "tierAccess", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(DatePublishedFilter),
    __metadata("design:type", String)
], FetchPostsDto.prototype, "datePublished", void 0);
class CommentsQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.CommentsQueryDto = CommentsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CommentsQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CommentsQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=posts.dto.js.map