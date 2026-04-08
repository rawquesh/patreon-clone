import { Document, Schema as MongooseSchema } from 'mongoose';
export declare class VisitReferrer {
    url?: string;
    source?: string;
    medium?: string;
    campaign?: string;
}
export declare class GeoLocation {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
}
export declare class DeviceInfo {
    deviceType?: string;
    browser?: string;
    os?: string;
}
export declare class CreatorVisit extends Document {
    visitor: MongooseSchema.Types.ObjectId;
    creator: MongooseSchema.Types.ObjectId;
    visitedAt: Date;
    visitCount: number;
    lastVisitedAt: Date;
    referrer?: VisitReferrer;
    geoLocation?: GeoLocation;
    deviceInfo?: DeviceInfo;
    visitHistory?: Date[];
    isSubscriber: boolean;
    membership?: MongooseSchema.Types.ObjectId;
}
export declare const CreatorVisitSchema: MongooseSchema<CreatorVisit, import("mongoose").Model<CreatorVisit, any, any, any, Document<unknown, any, CreatorVisit, any, {}> & CreatorVisit & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CreatorVisit, Document<unknown, {}, import("mongoose").FlatRecord<CreatorVisit>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<CreatorVisit> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
