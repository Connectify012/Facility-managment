import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskAssignment extends Document {
  facilityId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId; // Housekeeping, Gardening, etc.
  checklistId: mongoose.Types.ObjectId; // Which checklist to follow
  employeeId: mongoose.Types.ObjectId;
  floorLocationId: mongoose.Types.ObjectId;
  assignedDate: Date;
  dueDate?: Date;
  taskType: string; // 'daily', 'weekly', 'monthly'
  priority: string; // 'low', 'medium', 'high'
  status: string; // 'assigned', 'in_progress', 'completed', 'overdue'
  assignedBy: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const TaskAssignmentSchema = new Schema<ITaskAssignment>({
  facilityId: { type: Schema.Types.ObjectId, ref: 'FacilityDetails', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'HygieneSection', required: true },
  checklistId: { type: Schema.Types.ObjectId, ref: 'HygieneChecklist', required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  floorLocationId: { type: Schema.Types.ObjectId, ref: 'FloorLocation', required: true },
  assignedDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  taskType: { type: String, required: true }, // 'daily', 'weekly', 'monthly'
  priority: { type: String, default: 'medium' }, // 'low', 'medium', 'high'
  status: { type: String, default: 'assigned' }, // 'assigned', 'in_progress', 'completed', 'overdue'
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false, index: true }
}, {
  timestamps: true,
  collection: 'taskassignments'
});

// Indexes for better query performance
TaskAssignmentSchema.index({ facilityId: 1, isDeleted: 1 });
TaskAssignmentSchema.index({ employeeId: 1, isDeleted: 1 });
TaskAssignmentSchema.index({ floorLocationId: 1, isDeleted: 1 });
TaskAssignmentSchema.index({ status: 1 });
TaskAssignmentSchema.index({ assignedDate: -1 });
TaskAssignmentSchema.index({ dueDate: 1 });
TaskAssignmentSchema.index({ taskType: 1 });

export const TaskAssignment = mongoose.model<ITaskAssignment>('TaskAssignment', TaskAssignmentSchema);