import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskCompletion extends Document {
  taskAssignmentId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  floorLocationId: mongoose.Types.ObjectId;
  qrCodeScanned: string; // The QR code that was scanned
  completedAt: Date;
  completionNotes?: string;
  completionPhotos?: string[]; // Array of photo URLs/paths
  gpsLocation?: {
    latitude: number;
    longitude: number;
  };
  deviceInfo?: string; // Mobile device info
  ipAddress?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const TaskCompletionSchema = new Schema<ITaskCompletion>({
  taskAssignmentId: { type: Schema.Types.ObjectId, ref: 'TaskAssignment', required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  floorLocationId: { type: Schema.Types.ObjectId, ref: 'FloorLocation', required: true },
  qrCodeScanned: { type: String, required: true },
  completedAt: { type: Date, default: Date.now },
  completionNotes: { type: String },
  completionPhotos: [{ type: String }],
  gpsLocation: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  deviceInfo: { type: String },
  ipAddress: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false, index: true }
}, {
  timestamps: true,
  collection: 'taskcompletions'
});

// Indexes for better query performance
TaskCompletionSchema.index({ taskAssignmentId: 1, isDeleted: 1 });
TaskCompletionSchema.index({ employeeId: 1, isDeleted: 1 });
TaskCompletionSchema.index({ floorLocationId: 1, isDeleted: 1 });
TaskCompletionSchema.index({ qrCodeScanned: 1 });
TaskCompletionSchema.index({ completedAt: -1 });

export const TaskCompletion = mongoose.model<ITaskCompletion>('TaskCompletion', TaskCompletionSchema);