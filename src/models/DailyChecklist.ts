import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyChecklist extends Document {
  facilityId: mongoose.Types.ObjectId;
  hygieneSectionId: mongoose.Types.ObjectId;
  floorLocationId: mongoose.Types.ObjectId;
  checklistDate: Date; // Date for which this checklist is applicable
  checklistItems: Array<{
    itemName: string;
    description?: string;
    isCompleted: boolean;
    completedAt?: Date;
    completedBy?: mongoose.Types.ObjectId;
    notes?: string;
  }>;
  overallStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  startedAt?: Date;
  completedAt?: Date;
  assignedDepartment: string; // 'HOUSEKEEPING' | 'GARDENING' | 'PEST_CONTROL'
  completedBy?: mongoose.Types.ObjectId; // Employee who completed the checklist
  verifiedBy?: mongoose.Types.ObjectId; // Supervisor who verified the work
  verifiedAt?: Date;
  totalItems: number;
  completedItems: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const DailyChecklistSchema = new Schema<IDailyChecklist>({
  facilityId: { type: Schema.Types.ObjectId, ref: 'FacilityDetails', required: true },
  hygieneSectionId: { type: Schema.Types.ObjectId, ref: 'HygieneSection', required: true },
  floorLocationId: { type: Schema.Types.ObjectId, ref: 'FloorLocation', required: true },
  checklistDate: { type: Date, required: true },
  checklistItems: [{
    itemName: { type: String, required: true },
    description: { type: String },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  }],
  overallStatus: { 
    type: String, 
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], 
    default: 'PENDING' 
  },
  startedAt: { type: Date },
  completedAt: { type: Date },
  assignedDepartment: { 
    type: String, 
    required: true,
    enum: ['HOUSEKEEPING', 'GARDENING', 'PEST_CONTROL']
  },
  completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  totalItems: { type: Number, default: 0 },
  completedItems: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false, index: true }
}, {
  timestamps: true,
  collection: 'dailychecklists'
});

// Middleware to calculate totalItems and completedItems
DailyChecklistSchema.pre('save', function(next) {
  this.totalItems = this.checklistItems.length;
  this.completedItems = this.checklistItems.filter(item => item.isCompleted).length;
  
  // Update overall status based on completion
  if (this.completedItems === 0) {
    this.overallStatus = 'PENDING';
  } else if (this.completedItems === this.totalItems) {
    this.overallStatus = 'COMPLETED';
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  } else {
    this.overallStatus = 'IN_PROGRESS';
    if (!this.startedAt) {
      this.startedAt = new Date();
    }
  }
  
  next();
});

// Indexes for better query performance
DailyChecklistSchema.index({ facilityId: 1, isDeleted: 1 });
DailyChecklistSchema.index({ hygieneSectionId: 1 });
DailyChecklistSchema.index({ floorLocationId: 1 });
DailyChecklistSchema.index({ checklistDate: 1 });
DailyChecklistSchema.index({ overallStatus: 1 });
DailyChecklistSchema.index({ assignedDepartment: 1 });
DailyChecklistSchema.index({ isActive: 1 });

// Compound index for efficient querying
DailyChecklistSchema.index({ 
  facilityId: 1, 
  checklistDate: 1, 
  floorLocationId: 1, 
  hygieneSectionId: 1 
});

export const DailyChecklist = mongoose.model<IDailyChecklist>('DailyChecklist', DailyChecklistSchema);