import mongoose, { Document, Schema } from 'mongoose';

export interface IHygieneChecklist extends Document {
  facilityId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId; // Reference to HygieneSection
  checklistType: string; // 'daily', 'weekly', 'monthly'
  fileName: string; // Original file name
  filePath: string; // Storage path
  fileSize: number; // File size in bytes
  uploadDate: Date;
  uploadedBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const HygieneChecklistSchema = new Schema<IHygieneChecklist>({
  facilityId: { type: Schema.Types.ObjectId, ref: 'FacilityDetails', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'HygieneSection', required: true },
  checklistType: { type: String, required: true }, // 'daily', 'weekly', 'monthly'
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false, index: true }
}, {
  timestamps: true,
  collection: 'hygienechecklists'
});

// Indexes for better query performance
HygieneChecklistSchema.index({ facilityId: 1, isDeleted: 1 });
HygieneChecklistSchema.index({ sectionId: 1, isDeleted: 1 });
HygieneChecklistSchema.index({ checklistType: 1 });
HygieneChecklistSchema.index({ uploadDate: -1 });
HygieneChecklistSchema.index({ isActive: 1 });

export const HygieneChecklist = mongoose.model<IHygieneChecklist>('HygieneChecklist', HygieneChecklistSchema);