import mongoose, { Document } from 'mongoose';
export interface IEmployee extends Document {
    name: string;
    employeeId: string;
    email: string;
    position: string;
    department: string;
    weekOff: number;
    holidays: Date[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IEmployee, {}, {}, {}, mongoose.Document<unknown, {}, IEmployee, {}> & IEmployee & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Employee.d.ts.map