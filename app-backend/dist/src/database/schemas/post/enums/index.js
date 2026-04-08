"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostStatus = exports.PostType = void 0;
var PostType;
(function (PostType) {
    PostType["TEXT"] = "text";
    PostType["IMAGE"] = "image";
    PostType["AUDIO"] = "audio";
    PostType["VIDEO"] = "video";
    PostType["LINK"] = "link";
})(PostType || (exports.PostType = PostType = {}));
var PostStatus;
(function (PostStatus) {
    PostStatus["DRAFT"] = "draft";
    PostStatus["PUBLISHED"] = "published";
    PostStatus["ARCHIVED"] = "archived";
})(PostStatus || (exports.PostStatus = PostStatus = {}));
//# sourceMappingURL=index.js.map