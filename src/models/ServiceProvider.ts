import { Document, model, Model, Schema, Types } from 'mongoose';

// Service Category enum (matching ServiceManagement categories)
export enum ServiceCategory {
  SOFT_SERVICES = 'Soft Services',
  TECHNICAL_SERVICES = 'Technical Services',
  AMCS = 'AMCs',
  STATUTORY = 'Statutory',
  SECURITY = 'Security',
  ATTENDANCE = 'Attendance'
}

// Contract Status enum
export enum ContractStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending', 
  EXPIRED = 'Expired'
}

export interface IServiceProvider extends Document {
  _id: Types.ObjectId;
  facilityId: Types.ObjectId;
  providerName: string;
  category: ServiceCategory;
  contactPerson: string;
  phone: string;
  email: string;
  contractStatus: ContractStatus;
  contractStartDate?: Date;
  contractEndDate?: Date;
  services?: string[]; // Array of service names they provide
  description?: string;
  address?: string;
  rating?: number;
  totalContracts?: number;
  isActive: boolean;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for static methods
export interface IServiceProviderModel extends Model<IServiceProvider> {
  getByCategory(facilityId: Types.ObjectId, category: ServiceCategory): Promise<IServiceProvider[]>;
  getActiveProviders(facilityId: Types.ObjectId): Promise<IServiceProvider[]>;
}

const serviceProviderSchema = new Schema<IServiceProvider>({
  facilityId: {
    type: Schema.Types.ObjectId,
    ref: 'FacilityDetails',
    required: true,
    index: true
  },
  providerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    enum: Object.values(ServiceCategory),
    required: true,
    index: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  contractStatus: {
    type: String,
    enum: Object.values(ContractStatus),
    required: true,
    default: ContractStatus.PENDING,
    index: true
  },
  contractStartDate: {
    type: Date
  },
  contractEndDate: {
    type: Date
  },
  services: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  address: {
    type: String,
    trim: true,
    maxlength: 200
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalContracts: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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
serviceProviderSchema.index({ facilityId: 1, category: 1 });
serviceProviderSchema.index({ facilityId: 1, contractStatus: 1 });
serviceProviderSchema.index({ facilityId: 1, isActive: 1, isDeleted: 1 });
serviceProviderSchema.index({ email: 1 });
serviceProviderSchema.index({ createdAt: -1 });

// Text search index
serviceProviderSchema.index({
  providerName: 'text',
  contactPerson: 'text',
  description: 'text',
  services: 'text'
});

// Compound unique index to prevent duplicate providers for same facility and category
serviceProviderSchema.index(
  { facilityId: 1, providerName: 1, category: 1, isDeleted: 1 },
  { 
    unique: true,
    partialFilterExpression: { isDeleted: false }
  }
);

// Virtual for contract duration
serviceProviderSchema.virtual('contractDuration').get(function() {
  if (this.contractStartDate && this.contractEndDate) {
    const diffTime = this.contractEndDate.getTime() - this.contractStartDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Virtual for contract remaining days
serviceProviderSchema.virtual('contractRemainingDays').get(function() {
  if (this.contractEndDate) {
    const diffTime = this.contractEndDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  return null;
});

// Virtual for contract status based on dates
serviceProviderSchema.virtual('isContractExpired').get(function() {
  if (this.contractEndDate) {
    return new Date() > this.contractEndDate;
  }
  return false;
});

// Pre-save middleware to update contract status based on dates
serviceProviderSchema.pre('save', function(next) {
  if (this.contractEndDate && new Date() > this.contractEndDate) {
    this.contractStatus = ContractStatus.EXPIRED;
  } else if (this.contractStartDate && this.contractEndDate && 
             new Date() >= this.contractStartDate && new Date() <= this.contractEndDate) {
    this.contractStatus = ContractStatus.ACTIVE;
  }
  next();
});

// Static method to get providers by category
serviceProviderSchema.statics.getByCategory = function(facilityId: Types.ObjectId, category: ServiceCategory) {
  return this.find({
    facilityId,
    category,
    isDeleted: false
  }).populate('createdBy', 'firstName lastName email');
};

// Static method to get active providers
serviceProviderSchema.statics.getActiveProviders = function(facilityId: Types.ObjectId) {
  return this.find({
    facilityId,
    isActive: true,
    isDeleted: false,
    contractStatus: { $ne: ContractStatus.EXPIRED }
  }).populate('createdBy', 'firstName lastName email');
};

export const ServiceProvider = model<IServiceProvider, IServiceProviderModel>('ServiceProvider', serviceProviderSchema, 'serviceProviders');