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
exports.CreatorVisitSchema = exports.CreatorVisit = exports.DeviceInfo = exports.GeoLocation = exports.VisitReferrer = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let VisitReferrer = class VisitReferrer {
};
exports.VisitReferrer = VisitReferrer;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], VisitReferrer.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], VisitReferrer.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], VisitReferrer.prototype, "medium", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], VisitReferrer.prototype, "campaign", void 0);
exports.VisitReferrer = VisitReferrer = __decorate([
    (0, mongoose_1.Schema)()
], VisitReferrer);
let GeoLocation = class GeoLocation {
};
exports.GeoLocation = GeoLocation;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], GeoLocation.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], GeoLocation.prototype, "region", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], GeoLocation.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], GeoLocation.prototype, "timezone", void 0);
exports.GeoLocation = GeoLocation = __decorate([
    (0, mongoose_1.Schema)()
], GeoLocation);
let DeviceInfo = class DeviceInfo {
};
exports.DeviceInfo = DeviceInfo;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DeviceInfo.prototype, "deviceType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DeviceInfo.prototype, "browser", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DeviceInfo.prototype, "os", void 0);
exports.DeviceInfo = DeviceInfo = __decorate([
    (0, mongoose_1.Schema)()
], DeviceInfo);
let CreatorVisit = class CreatorVisit extends mongoose_2.Document {
};
exports.CreatorVisit = CreatorVisit;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], CreatorVisit.prototype, "visitor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], CreatorVisit.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], CreatorVisit.prototype, "visitedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], CreatorVisit.prototype, "visitCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], CreatorVisit.prototype, "lastVisitedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: VisitReferrer }),
    __metadata("design:type", VisitReferrer)
], CreatorVisit.prototype, "referrer", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: GeoLocation }),
    __metadata("design:type", GeoLocation)
], CreatorVisit.prototype, "geoLocation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: DeviceInfo }),
    __metadata("design:type", DeviceInfo)
], CreatorVisit.prototype, "deviceInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Date], default: [] }),
    __metadata("design:type", Array)
], CreatorVisit.prototype, "visitHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], CreatorVisit.prototype, "isSubscriber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Membership' }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], CreatorVisit.prototype, "membership", void 0);
exports.CreatorVisit = CreatorVisit = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], CreatorVisit);
exports.CreatorVisitSchema = mongoose_1.SchemaFactory.createForClass(CreatorVisit);
exports.CreatorVisitSchema.index({ visitor: 1, creator: 1 }, { unique: true });
exports.CreatorVisitSchema.index({ visitor: 1, lastVisitedAt: -1 });
exports.CreatorVisitSchema.index({ creator: 1, lastVisitedAt: -1 });
exports.CreatorVisitSchema.index({ creator: 1, isSubscriber: 1 });
exports.CreatorVisitSchema.index({ 'geoLocation.country': 1, creator: 1 });
exports.CreatorVisitSchema.index({ 'deviceInfo.deviceType': 1, creator: 1 });
exports.CreatorVisitSchema.index({ 'referrer.source': 1, creator: 1 });
//# sourceMappingURL=visit-history.schema.js.map