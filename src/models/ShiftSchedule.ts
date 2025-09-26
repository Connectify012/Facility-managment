import mongoose, { Document, Schema } from 'mongoose';

export interface IShiftSchedule extends Document {
  facilityId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  shiftName: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  workingDays: string[]; // ["monday", ...]
  breakDuration: number; // in minutes
  rosterDate: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const ShiftScheduleSchema = new Schema<IShiftSchedule>({
  facilityId: { type: Schema.Types.ObjectId, ref: 'FacilityDetails', required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  shiftName: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  workingDays: [{ type: String, required: true }],
  breakDuration: { type: Number, default: 60 },
  rosterDate: { type: Date, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false, index: true }
}, {
  timestamps: true,
  collection: 'shiftschedules'
});

export const ShiftSchedule = mongoose.model<IShiftSchedule>('ShiftSchedule', ShiftScheduleSchema);
