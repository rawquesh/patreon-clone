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
exports.PostsInsightsDto = exports.TransactionDetailsDto = exports.EarningsInsightsDto = exports.MembershipInsightsDto = exports.EarningsFilter = exports.TimeRange = void 0;
const class_validator_1 = require("class-validator");
var TimeRange;
(function (TimeRange) {
    TimeRange["SEVEN_DAYS"] = "7d";
    TimeRange["FOURTEEN_DAYS"] = "14d";
    TimeRange["THIRTY_DAYS"] = "30d";
    TimeRange["NINETY_DAYS"] = "90d";
    TimeRange["ONE_EIGHTY_DAYS"] = "180d";
    TimeRange["THREE_MONTHS"] = "3m";
    TimeRange["SIX_MONTHS"] = "6m";
    TimeRange["ONE_YEAR"] = "1y";
    TimeRange["ALL_TIME"] = "all";
})(TimeRange || (exports.TimeRange = TimeRange = {}));
var EarningsFilter;
(function (EarningsFilter) {
    EarningsFilter["ALL"] = "all";
    EarningsFilter["MEMBERSHIP"] = "membership";
})(EarningsFilter || (exports.EarningsFilter = EarningsFilter = {}));
class MembershipInsightsDto {
    constructor() {
        this.timeRange = TimeRange.THIRTY_DAYS;
    }
}
exports.MembershipInsightsDto = MembershipInsightsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TimeRange),
    __metadata("design:type", String)
], MembershipInsightsDto.prototype, "timeRange", void 0);
class EarningsInsightsDto {
    constructor() {
        this.timeRange = TimeRange.SIX_MONTHS;
        this.filter = EarningsFilter.ALL;
    }
}
exports.EarningsInsightsDto = EarningsInsightsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TimeRange),
    __metadata("design:type", String)
], EarningsInsightsDto.prototype, "timeRange", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(EarningsFilter),
    __metadata("design:type", String)
], EarningsInsightsDto.prototype, "filter", void 0);
class TransactionDetailsDto {
    constructor() {
        this.timeRange = TimeRange.THIRTY_DAYS;
    }
}
exports.TransactionDetailsDto = TransactionDetailsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TimeRange),
    __metadata("design:type", String)
], TransactionDetailsDto.prototype, "timeRange", void 0);
class PostsInsightsDto {
    constructor() {
        this.timeRange = TimeRange.FOURTEEN_DAYS;
    }
}
exports.PostsInsightsDto = PostsInsightsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TimeRange),
    __metadata("design:type", String)
], PostsInsightsDto.prototype, "timeRange", void 0);
//# sourceMappingURL=analytics.dto.js.map