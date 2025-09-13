import mongoose, { Document } from 'mongoose';
export interface ITimetableEntry extends Document {
    employeeId: string;
    date: Date;
    shiftCode: string;
    status: 'scheduled' | 'off' | 'leave' | 'holiday';
    notes?: string;
}
export interface ITimetable extends Document {
    month: number;
    year: number;
    projectName: string;
    entries: ITimetableEntry[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITimetable, {}, {}, {}, mongoose.Document<unknown, {}, ITimetable, {}> & ITimetable & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Timetable.d.ts.map