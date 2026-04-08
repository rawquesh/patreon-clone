"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserReportReason = exports.ReportStatus = exports.ReportReason = void 0;
var ReportReason;
(function (ReportReason) {
    ReportReason["SPAM"] = "spam";
    ReportReason["INAPPROPRIATE_CONTENT"] = "inappropriate_content";
    ReportReason["HARASSMENT"] = "harassment";
    ReportReason["HATE_SPEECH"] = "hate_speech";
    ReportReason["VIOLENCE"] = "violence";
    ReportReason["MISINFORMATION"] = "misinformation";
    ReportReason["COPYRIGHT_VIOLATION"] = "copyright_violation";
    ReportReason["OTHER"] = "other";
})(ReportReason || (exports.ReportReason = ReportReason = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["PENDING"] = "pending";
    ReportStatus["UNDER_REVIEW"] = "under_review";
    ReportStatus["RESOLVED"] = "resolved";
    ReportStatus["DISMISSED"] = "dismissed";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
var UserReportReason;
(function (UserReportReason) {
    UserReportReason["SPAM"] = "spam";
    UserReportReason["IMPERSONATION"] = "impersonation";
    UserReportReason["HARASSMENT"] = "harassment";
    UserReportReason["HATE_SPEECH"] = "hate_speech";
    UserReportReason["INAPPROPRIATE_PROFILE"] = "inappropriate_profile";
    UserReportReason["SCAM_OR_FRAUD"] = "scam_or_fraud";
    UserReportReason["UNDERAGE_USER"] = "underage_user";
    UserReportReason["OTHER"] = "other";
})(UserReportReason || (exports.UserReportReason = UserReportReason = {}));
//# sourceMappingURL=index.js.map