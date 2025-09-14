import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  employeeId: string;
  email: string;
  position: string;
  department: string;
  weekOff: number; // 0 = Sunday, 1 = Monday, etc.
  holidays: Date[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  weekOff: { type: Number, default: 0 }, // Default Sunday off
  holidays: [{ type: Date }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);