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
exports.MembersResponseDto = exports.PaginationDto = exports.MemberDto = exports.MemberTierDto = exports.GetMembersDto = exports.SubscriptionStatus = exports.SortOrder = exports.MemberSortBy = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var MemberSortBy;
(function (MemberSortBy) {
    MemberSortBy["NAME"] = "name";
    MemberSortBy["EMAIL"] = "email";
    MemberSortBy["JOIN_DATE"] = "joinDate";
    MemberSortBy["TOTAL_PAID"] = "totalPaid";
    MemberSortBy["TIER"] = "tier";
    MemberSortBy["STATUS"] = "status";
})(MemberSortBy || (exports.MemberSortBy = MemberSortBy = {}));
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["CANCELLED"] = "cancelled";
    SubscriptionStatus["EXPIRED"] = "expired";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
class GetMembersDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = MemberSortBy.JOIN_DATE;
        this.sortOrder = SortOrder.DESC;
    }
}
exports.GetMembersDto = GetMembersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GetMembersDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GetMembersDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMembersDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SubscriptionStatus),
    __metadata("design:type", String)
], GetMembersDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMembersDto.prototype, "tier", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMembersDto.prototype, "joinDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(MemberSortBy),
    __metadata("design:type", String)
], GetMembersDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortOrder),
    __metadata("design:type", String)
], GetMembersDto.prototype, "sortOrder", void 0);
class MemberTierDto {
}
exports.MemberTierDto = MemberTierDto;
class MemberDto {
}
exports.MemberDto = MemberDto;
class PaginationDto {
}
exports.PaginationDto = PaginationDto;
class MembersResponseDto {
}
exports.MembersResponseDto = MembersResponseDto;
//# sourceMappingURL=members.dto.js.map