import { Document } from 'mongoose';
export type DeviceDocument = Device & Document;
export declare class Device {
    token: string;
    userId: string;
}
export declare const DeviceSchema: import("mongoose").Schema<Device, import("mongoose").Model<Device, any, any, any, Document<unknown, any, Device, any, {}> & Device & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Device, Document<unknown, {}, import("mongoose").FlatRecord<Device>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Device> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
