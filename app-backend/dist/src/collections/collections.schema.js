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
exports.CollectionSchema = exports.Collection = void 0;
const user_1 = require("../database/schemas/user");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Collection = class Collection extends mongoose_2.Document {
};
exports.Collection = Collection;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Collection.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Collection.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Collection.prototype, "coverImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", user_1.User)
], Collection.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Collection.prototype, "postCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Collection.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Collection.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'Post' }],
        default: [],
    }),
    __metadata("design:type", Array)
], Collection.prototype, "posts", void 0);
exports.Collection = Collection = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Collection);
exports.CollectionSchema = mongoose_1.SchemaFactory.createForClass(Collection);
exports.CollectionSchema.index({ creator: 1, title: 1 });
exports.CollectionSchema.index({ title: 'text', description: 'text' });
exports.CollectionSchema.index({ posts: 1 });
//# sourceMappingURL=collections.schema.js.map