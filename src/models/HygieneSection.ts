import mongoose, { Document, Schema } from 'mongoose';

export interface IHygieneSection extends Document {
  facilityId: mongoose.Types.ObjectId;
  sectionName: string; // 'Housekeeping', 'Gardening', 'Pest Control', etc.
  description?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const HygieneSectionSchema = new Schema<IHygieneSection>({
  facilityId: { type: Schema.Types.ObjectId, ref: 'FacilityDetails', required: true },
  sectionName: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false, index: true }
}, {
  timestamps: true,
  collection: 'hygienesections'
});

// Indexes for better query performance
HygieneSectionSchema.index({ facilityId: 1, isDeleted: 1 });
HygieneSectionSchema.index({ sectionName: 1 });
HygieneSectionSchema.index({ isActive: 1 });

export const HygieneSection = mongoose.model<IHygieneSection>('HygieneSection', HygieneSectionSchema);