import mongoose, { Document, Schema } from 'mongoose';

export interface IRoster extends Document {
  facilityId: mongoose.Types.ObjectId;
  date: Date;
  shifts: Array<{
    shiftScheduleId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    status: string; // e.g. 'present', 'absent', 'leave', etc.
    remarks?: string;
  }>;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const RosterSchema = new Schema<IRoster>({
  facilityId: { type: Schema.Types.ObjectId, ref: 'FacilityDetails', required: true },
  date: { type: Date, required: true },
  shifts: [
    {
      shiftScheduleId: { type: Schema.Types.ObjectId, ref: 'ShiftSchedule', required: true },
      employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      status: { type: String, default: 'present' },
      remarks: { type: String }
    }
  ],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false, index: true }
}, {
  timestamps: true,
  collection: 'rosters'
});

export const Roster = mongoose.model<IRoster>('Roster', RosterSchema);
