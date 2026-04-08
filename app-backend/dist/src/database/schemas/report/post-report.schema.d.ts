import { Document, Schema as MongooseSchema } from 'mongoose';
import { ReportReason, ReportStatus } from './enums';
export declare class PostReport extends Document {
    _id: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    post: MongooseSchema.Types.ObjectId;
    reportedBy: MongooseSchema.Types.ObjectId;
    reason: ReportReason;
    description: string;
    status: ReportStatus;
    adminNotes?: string;
    reviewedBy?: MongooseSchema.Types.ObjectId;
    reviewedAt?: Date;
    additionalContext?: string;
}
export declare const PostReportSchema: MongooseSchema<PostReport, import("mongoose").Model<PostReport, any, any, any, Document<unknown, any, PostReport, any, {}> & PostReport & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PostReport, Document<unknown, {}, import("mongoose").FlatRecord<PostReport>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PostReport> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
