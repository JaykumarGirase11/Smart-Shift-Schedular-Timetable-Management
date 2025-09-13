import mongoose, { Schema, Document } from 'mongoose';

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

const ShiftSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  color: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<IShift>('Shift', ShiftSchema);