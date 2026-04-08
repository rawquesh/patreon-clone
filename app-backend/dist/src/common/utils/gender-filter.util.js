"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGenderFilters = addGenderFilters;
const enums_1 = require("../../database/schemas/user/enums");
function addGenderFilters(baseFilter, requestingUser) {
    const filter = { ...baseFilter };
    const genderConditions = [];
    if (requestingUser?.genderPreference &&
        requestingUser.genderPreference !== enums_1.GenderPreference.BOTH) {
        genderConditions.push({
            $or: [
                { gender: 'male' },
                { gender: 'Male' },
                { gender: 'female' },
                { gender: 'Female' },
            ].filter((f) => requestingUser.genderPreference === enums_1.GenderPreference.MALE
                ? f.gender === 'male' || f.gender === 'Male'
                : f.gender === 'female' || f.gender === 'Female'),
        });
    }
    if (requestingUser?.gender) {
        const userGenderLower = requestingUser.gender.toLowerCase();
        if (userGenderLower === 'male' || userGenderLower === 'female') {
            genderConditions.push({
                $or: [
                    { contentVisibleTo: enums_1.ContentVisibility.BOTH },
                    { contentVisibleTo: userGenderLower },
                ],
            });
        }
        else {
            genderConditions.push({ contentVisibleTo: enums_1.ContentVisibility.BOTH });
        }
    }
    else {
        genderConditions.push({ contentVisibleTo: enums_1.ContentVisibility.BOTH });
    }
    if (genderConditions.length > 0) {
        if (filter.$and) {
            filter.$and = Array.isArray(filter.$and)
                ? [...filter.$and, ...genderConditions]
                : [filter.$and, ...genderConditions];
        }
        else {
            filter.$and = genderConditions;
        }
    }
    return filter;
}
//# sourceMappingURL=gender-filter.util.js.map