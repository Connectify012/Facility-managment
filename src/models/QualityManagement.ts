import mongoose, { Document, Schema } from 'mongoose';

// STP (Sewage Treatment Plant) Interface
export interface ISTP extends Document {
  mlss: number; // mg/L - Mixed Liquor Suspended Solids
  mlssNormalRangeMin: number;
  mlssNormalRangeMax: number;
  backwash: 'ON' | 'OFF';
  backwashWaterFlow: number; // KL
  status: 'active' | 'inactive';
  facilityId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// WTP (Water Treatment Plant) Interface
export interface IWTP extends Document {
  inputHardness: number; // ppm
  outputHardness: number; // ppm
  regeneration: 'ON' | 'OFF';
  regenWaterFlow: number; // KL
  tds: number; // ppm - Total Dissolved Solids
  status: 'active' | 'inactive';
  facilityId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Swimming Pool Interface
export interface ISwimmingPool extends Document {
  phLevel: number;
  phNormalRangeMin: number;
  phNormalRangeMax: number;
  chlorine: number; // ppm
  chlorineNormalRangeMin: number;
  chlorineNormalRangeMax: number;
  backwash: 'ON' | 'OFF';
  backwashFlow: number; // KL
  status: 'active' | 'inactive';
  facilityId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// RO Plant Interface
export interface IROPlant extends Document {
  inputTDS: number; // ppm
  outputTDS: number; // ppm
  regeneration: 'ON' | 'OFF';
  regenWaterFlow: number; // KL
  usagePointHardness: number; // ppm
  status: 'active' | 'inactive';
  facilityId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// STP Schema
const STPSchema = new Schema<ISTP>(
  {
    mlss: {
      type: Number,
      required: [true, 'MLSS is required'],
      min: [0, 'MLSS must be positive']
    },
    mlssNormalRangeMin: {
      type: Number,
      default: 2000
    },
    mlssNormalRangeMax: {
      type: Number,
      default: 4000
    },
    backwash: {
      type: String,
      enum: ['ON', 'OFF'],
      default: 'OFF'
    },
    backwashWaterFlow: {
      type: Number,
      min: [0, 'Backwash water flow must be positive'],
      default: 0
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

// WTP Schema
const WTPSchema = new Schema<IWTP>(
  {
    inputHardness: {
      type: Number,
      required: [true, 'Input hardness is required'],
      min: [0, 'Input hardness must be positive']
    },
    outputHardness: {
      type: Number,
      required: [true, 'Output hardness is required'],
      min: [0, 'Output hardness must be positive']
    },
    regeneration: {
      type: String,
      enum: ['ON', 'OFF'],
      default: 'OFF'
    },
    regenWaterFlow: {
      type: Number,
      min: [0, 'Regen water flow must be positive'],
      default: 0
    },
    tds: {
      type: Number,
      required: [true, 'TDS is required'],
      min: [0, 'TDS must be positive']
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

// Swimming Pool Schema
const SwimmingPoolSchema = new Schema<ISwimmingPool>(
  {
    phLevel: {
      type: Number,
      required: [true, 'pH level is required'],
      min: [0, 'pH level must be positive'],
      max: [14, 'pH level must be between 0-14']
    },
    phNormalRangeMin: {
      type: Number,
      default: 7.2
    },
    phNormalRangeMax: {
      type: Number,
      default: 7.6
    },
    chlorine: {
      type: Number,
      required: [true, 'Chlorine level is required'],
      min: [0, 'Chlorine level must be positive']
    },
    chlorineNormalRangeMin: {
      type: Number,
      default: 1.0
    },
    chlorineNormalRangeMax: {
      type: Number,
      default: 3.0
    },
    backwash: {
      type: String,
      enum: ['ON', 'OFF'],
      default: 'OFF'
    },
    backwashFlow: {
      type: Number,
      min: [0, 'Backwash flow must be positive'],
      default: 0
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

// RO Plant Schema
const ROPlantSchema = new Schema<IROPlant>(
  {
    inputTDS: {
      type: Number,
      required: [true, 'Input TDS is required'],
      min: [0, 'Input TDS must be positive']
    },
    outputTDS: {
      type: Number,
      required: [true, 'Output TDS is required'],
      min: [0, 'Output TDS must be positive']
    },
    regeneration: {
      type: String,
      enum: ['ON', 'OFF'],
      default: 'OFF'
    },
    regenWaterFlow: {
      type: Number,
      min: [0, 'Regen water flow must be positive'],
      default: 0
    },
    usagePointHardness: {
      type: Number,
      required: [true, 'Usage point hardness is required'],
      min: [0, 'Usage point hardness must be positive']
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

// Indexes for performance
STPSchema.index({ facilityId: 1 });
WTPSchema.index({ facilityId: 1 });
SwimmingPoolSchema.index({ facilityId: 1 });
ROPlantSchema.index({ facilityId: 1 });

export const STP = mongoose.model<ISTP>('STP', STPSchema);
export const WTP = mongoose.model<IWTP>('WTP', WTPSchema);
export const SwimmingPool = mongoose.model<ISwimmingPool>('SwimmingPool', SwimmingPoolSchema);
export const ROPlant = mongoose.model<IROPlant>('ROPlant', ROPlantSchema);