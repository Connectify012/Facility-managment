import { Document, model, Schema, Types } from 'mongoose';

export interface IFacilityDetails extends Document {
  _id: Types.ObjectId;
  tenantId: string;
  siteName: string;
  city: string;
  location: string;
  clientName: string;
  position: string;
  contactNo: string;
  email?: string;
  facilityType: string;
  additionalInfo?: any;
  settings?: any;
  createdAt: Date;
  updatedAt: Date;
}

const facilityDetailsSchema = new Schema<IFacilityDetails>({
  tenantId: {
    type: String,
    required: true,
    unique: true,
    default: () => new Types.ObjectId().toString() // Auto-generate tenant ID
  },
  siteName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  clientName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  position: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  contactNo: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Please provide a valid contact number'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  facilityType: {
    type: String,
    required: true
  },
  additionalInfo: {
    type: Schema.Types.Mixed,
    default: {}
  },
  settings: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better performance
facilityDetailsSchema.index({ tenantId: 1 });
facilityDetailsSchema.index({ city: 1 });
facilityDetailsSchema.index({ facilityType: 1 });
facilityDetailsSchema.index({ clientName: 1 });
facilityDetailsSchema.index({ createdAt: -1 });

// Text search index
facilityDetailsSchema.index({
  siteName: 'text',
  city: 'text',
  location: 'text',
  clientName: 'text'
});

export const FacilityDetails = model<IFacilityDetails>('FacilityDetails', facilityDetailsSchema, 'facilityDetails');
