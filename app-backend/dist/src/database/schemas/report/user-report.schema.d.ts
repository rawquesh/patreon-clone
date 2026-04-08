import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserReportReason, ReportStatus } from './enums';
export declare class UserReport extends Document {
    _id: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
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
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserReport, Document<unknown, {}, import("mongoose").FlatRecord<UserReport>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<UserReport> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
