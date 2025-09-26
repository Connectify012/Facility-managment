import mongoose, { Document, Schema } from 'mongoose';

export interface ILeavePlanner extends Document {
  facilityId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  leaveType: string; // 'sick', 'annual', 'emergency', 'maternity', 'personal', etc.
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string;
  status: string; // 'pending', 'approved', 'rejected'
  appliedDate: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedDate?: Date;
  remarks?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const LeavePlannerSchema = new Schema<ILeavePlanner>({
  facilityId: { type: Schema.Types.ObjectId, ref: 'FacilityDetails', required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { 
    type: String, 
    enum: ['sick', 'annual', 'emergency', 'maternity', 'paternity', 'personal', 'casual', 'bereavement'],
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  reason: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  appliedDate: { type: Date, default: Date.now },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedDate: { type: Date },
  remarks: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false, index: true }
}, {
  timestamps: true,
  collection: 'leaveplanners'
});

// Indexes for better query performance
LeavePlannerSchema.index({ facilityId: 1, isDeleted: 1 });
LeavePlannerSchema.index({ employeeId: 1, isDeleted: 1 });
LeavePlannerSchema.index({ startDate: 1, endDate: 1 });
LeavePlannerSchema.index({ status: 1 });
LeavePlannerSchema.index({ leaveType: 1 });
LeavePlannerSchema.index({ appliedDate: -1 });

export const LeavePlanner = mongoose.model<ILeavePlanner>('LeavePlanner', LeavePlannerSchema);