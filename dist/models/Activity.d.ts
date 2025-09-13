import mongoose from 'mongoose';
declare const Activity: mongoose.Model<{
    username: string;
    timestamp: NativeDate;
    userId: mongoose.Types.ObjectId;
    action: "delete" | "view" | "login" | "logout" | "create" | "update";
    details: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    username: string;
    timestamp: NativeDate;
    userId: mongoose.Types.ObjectId;
    action: "delete" | "view" | "login" | "logout" | "create" | "update";
    details: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
}, {}> & {
    username: string;
    timestamp: NativeDate;
    userId: mongoose.Types.ObjectId;
    action: "delete" | "view" | "login" | "logout" | "create" | "update";
    details: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    username: string;
    timestamp: NativeDate;
    userId: mongoose.Types.ObjectId;
    action: "delete" | "view" | "login" | "logout" | "create" | "update";
    details: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    username: string;
    timestamp: NativeDate;
    userId: mongoose.Types.ObjectId;
    action: "delete" | "view" | "login" | "logout" | "create" | "update";
    details: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
}>, {}> & mongoose.FlatRecord<{
    username: string;
    timestamp: NativeDate;
    userId: mongoose.Types.ObjectId;
    action: "delete" | "view" | "login" | "logout" | "create" | "update";
    details: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default Activity;
//# sourceMappingURL=Activity.d.ts.map