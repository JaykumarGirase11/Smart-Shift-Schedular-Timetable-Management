import mongoose, { Schema, Document } from 'mongoose';

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

const TimetableEntrySchema: Schema = new Schema({
  employeeId: { type: String, required: true },
  date: { type: Date, required: true },
  shiftCode: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'off', 'leave', 'holiday'],
    default: 'scheduled'
  },
  notes: { type: String }
});

const TimetableSchema: Schema = new Schema({
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  projectName: { type: String, required: true },
  entries: [TimetableEntrySchema],
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

// Create compound index for efficient queries
TimetableSchema.index({ month: 1, year: 1, projectName: 1 });

export default mongoose.model<ITimetable>('Timetable', TimetableSchema);