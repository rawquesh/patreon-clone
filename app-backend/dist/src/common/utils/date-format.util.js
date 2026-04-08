"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.getReadablePostType = getReadablePostType;
function formatDate(date) {
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    const d = new Date(date);
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function getReadablePostType(type) {
    const typeMap = {
        text: 'Text',
        image: 'Picture',
        audio: 'Audio',
        video: 'Video',
        link: 'Link',
    };
    return typeMap[type] ?? type;
}
//# sourceMappingURL=date-format.util.js.map