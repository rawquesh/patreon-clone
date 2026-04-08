import { Document, Schema as MongooseSchema } from 'mongoose';
export declare class PayoutRequest extends Document {
    createdAt: Date;
    updatedAt: Date;
    creator: MongooseSchema.Types.ObjectId;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    stripeTransferId?: string;
    completedAt?: Date;
    failureReason?: string;
}
export declare const PayoutRequestSchema: MongooseSchema<PayoutRequest, import("mongoose").Model<PayoutRequest, any, any, any, Document<unknown, any, PayoutRequest, any, {}> & PayoutRequest & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayoutRequest, Document<unknown, {}, import("mongoose").FlatRecord<PayoutRequest>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PayoutRequest> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
