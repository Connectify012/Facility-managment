import mongoose, { Document, Schema } from 'mongoose';

export interface IWeekoffPlanner extends Document {
  facilityId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  weekEndDate: Date;
  weekoffDays: string[]; // ["monday", "tuesday", etc.]
  reason?: string;
  status: string; // 'pending', 'approved', 'rejected'
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const WeekoffPlannerSchema = new Schema<IWeekoffPlanner>({
  facilityId: { type: Schema.Types.ObjectId, ref: 'FacilityDetails', required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  weekStartDate: { type: Date, required: true },
  weekEndDate: { type: Date, required: true },
  weekoffDays: [{ type: String, required: true }],
  reason: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false, index: true }
}, {
  timestamps: true,
  collection: 'weekoffplanners'
});

// Indexes for better query performance
WeekoffPlannerSchema.index({ facilityId: 1, isDeleted: 1 });
WeekoffPlannerSchema.index({ employeeId: 1, isDeleted: 1 });
WeekoffPlannerSchema.index({ weekStartDate: 1, weekEndDate: 1 });
WeekoffPlannerSchema.index({ status: 1 });

export const WeekoffPlanner = mongoose.model<IWeekoffPlanner>('WeekoffPlanner', WeekoffPlannerSchema);