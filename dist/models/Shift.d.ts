import mongoose, { Document } from 'mongoose';
export interface IShift extends Document {
    name: string;
    code: string;
    startTime: string;
    endTime: string;
    color: string;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IShift, {}, {}, {}, mongoose.Document<unknown, {}, IShift, {}> & IShift & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Shift.d.ts.map