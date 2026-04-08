"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftType = exports.DiscountApplicability = exports.DiscountStatus = exports.DiscountType = void 0;
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENTAGE"] = "percentage";
    DiscountType["FLAT"] = "flat";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
var DiscountStatus;
(function (DiscountStatus) {
    DiscountStatus["ACTIVE"] = "active";
    DiscountStatus["INACTIVE"] = "inactive";
})(DiscountStatus || (exports.DiscountStatus = DiscountStatus = {}));
var DiscountApplicability;
(function (DiscountApplicability) {
    DiscountApplicability["ALL"] = "all";
    DiscountApplicability["SELECTED"] = "selected";
})(DiscountApplicability || (exports.DiscountApplicability = DiscountApplicability = {}));
var GiftType;
(function (GiftType) {
    GiftType["FREE_TRIAL"] = "free_trial";
    GiftType["FREE_CONTENT"] = "free_content";
})(GiftType || (exports.GiftType = GiftType = {}));
//# sourceMappingURL=index.js.map