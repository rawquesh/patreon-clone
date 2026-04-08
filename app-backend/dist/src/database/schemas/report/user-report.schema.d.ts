import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserReportReason, ReportStatus } from './enums';
export declare class UserReport extends Document {
    id: string;
    reportedUser: MongooseSchema.Types.ObjectId;
    reportedBy: MongooseSchema.Types.ObjectId;
    reason: UserReportReason;
    description: string;
    status: ReportStatus;
    adminNotes?: string;
    reviewedBy?: MongooseSchema.Types.ObjectId;
    reviewedAt?: Date;
    additionalContext?: string;
}
export declare const UserReportSchema: MongooseSchema<UserReport, import("mongoose").Model<UserReport, any, any, any, Document<unknown, any, UserReport, any, {}> & UserReport & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserReport, Document<unknown, {}, import("mongoose").FlatRecord<UserReport>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<UserReport> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
