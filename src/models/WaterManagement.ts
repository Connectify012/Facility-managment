import mongoose, { Document, Schema } from 'mongoose';

export interface IWaterTank extends Document {
  tankName: string;
  location: string;
  capacity: number; // in KL (Kiloliters)
  type: 'overhead' | 'underground' | 'surface' | 'storage';
  status: 'active' | 'inactive';
  facilityId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBorewell extends Document {
  borewellName: string;
  location: string;
  depth: number; // in meters
  waterSupplied: number; // in KL
  status: 'active' | 'inactive';
  facilityId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICauvery extends Document {
  waterSupplied: number; // in KL
  status: 'active' | 'inactive';
  facilityId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITanker extends Document {
  totalTankers: number;
  tankerCapacity: number; // in KL
  totalWaterSupplied: number; // calculated field
  status: 'active' | 'inactive';
  facilityId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WaterTankSchema = new Schema<IWaterTank>(
  {
    tankName: {
      type: String,
      required: [true, 'Tank name is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [0, 'Capacity must be positive']
    },
    type: {
      type: String,
      enum: ['overhead', 'underground', 'surface', 'storage'],
      required: [true, 'Tank type is required']
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

const BorewellSchema = new Schema<IBorewell>(
  {
    borewellName: {
      type: String,
      required: [true, 'Borewell name is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    depth: {
      type: Number,
      required: [true, 'Depth is required'],
      min: [0, 'Depth must be positive']
    },
    waterSupplied: {
      type: Number,
      required: [true, 'Water supplied is required'],
      min: [0, 'Water supplied must be positive']
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

const CauverySchema = new Schema<ICauvery>(
  {
    waterSupplied: {
      type: Number,
      required: [true, 'Water supplied is required'],
      min: [0, 'Water supplied must be positive']
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

const TankerSchema = new Schema<ITanker>(
  {
    totalTankers: {
      type: Number,
      required: [true, 'Total tankers is required'],
      min: [0, 'Total tankers must be positive']
    },
    tankerCapacity: {
      type: Number,
      required: [true, 'Tanker capacity is required'],
      min: [0, 'Tanker capacity must be positive']
    },
    totalWaterSupplied: {
      type: Number,
      default: function(this: ITanker) {
        return this.totalTankers * this.tankerCapacity;
      }
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

// Pre-save middleware to calculate total water supplied for tankers
TankerSchema.pre('save', function(next) {
  this.totalWaterSupplied = this.totalTankers * this.tankerCapacity;
  next();
});

WaterTankSchema.index({ facilityId: 1 });
BorewellSchema.index({ facilityId: 1 });
CauverySchema.index({ facilityId: 1 });
TankerSchema.index({ facilityId: 1 });

export const WaterTank = mongoose.model<IWaterTank>('WaterTank', WaterTankSchema);
export const Borewell = mongoose.model<IBorewell>('Borewell', BorewellSchema);
export const Cauvery = mongoose.model<ICauvery>('Cauvery', CauverySchema);
export const Tanker = mongoose.model<ITanker>('Tanker', TankerSchema);