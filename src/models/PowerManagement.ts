import mongoose, { Document, Schema } from 'mongoose';

export interface IPowerManagement extends Document {
  meterId: string;
  location: string;
  connectedLoad: number; // in kW
  units: number; // in kWh
  powerFactor: number;
  status: 'active' | 'inactive';
  facilityId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PowerManagementSchema = new Schema<IPowerManagement>(
  {
    meterId: {
      type: String,
      required: [true, 'Meter ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    connectedLoad: {
      type: Number,
      required: [true, 'Connected load is required'],
      min: [0, 'Connected load must be positive']
    },
    units: {
      type: Number,
      required: [true, 'Units are required'],
      min: [0, 'Units must be positive']
    },
    powerFactor: {
      type: Number,
      required: [true, 'Power factor is required'],
      min: [0, 'Power factor must be between 0 and 1'],
      max: [1, 'Power factor must be between 0 and 1']
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: 'FacilityDetails',
      required: [true, 'Facility ID is required']
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

PowerManagementSchema.index({ facilityId: 1 });
PowerManagementSchema.index({ meterId: 1 });
PowerManagementSchema.index({ status: 1 });

export const PowerManagement = mongoose.model<IPowerManagement>('PowerManagement', PowerManagementSchema);