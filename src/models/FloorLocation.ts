import mongoose, { Document, Schema } from 'mongoose';

export interface IFloorLocation extends Document {
  facilityId: mongoose.Types.ObjectId;
  floorName: string; // 'Floor 1', 'Floor 2', 'Ground Floor', etc.
  floorNumber: number; // 1, 2, 3, etc.
  qrCode: string; // Unique QR code identifier
  description?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const FloorLocationSchema = new Schema<IFloorLocation>({
  facilityId: { type: Schema.Types.ObjectId, ref: 'FacilityDetails', required: true },
  floorName: { type: String, required: true },
  floorNumber: { type: Number, required: true },
  qrCode: { type: String, required: true, unique: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false, index: true }
}, {
  timestamps: true,
  collection: 'floorlocations'
});

// Indexes for better query performance
FloorLocationSchema.index({ facilityId: 1, isDeleted: 1 });
FloorLocationSchema.index({ qrCode: 1 });
FloorLocationSchema.index({ floorNumber: 1 });
FloorLocationSchema.index({ isActive: 1 });

export const FloorLocation = mongoose.model<IFloorLocation>('FloorLocation', FloorLocationSchema);