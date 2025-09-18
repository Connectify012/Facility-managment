"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityDetails = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = require("mongoose");
const facilityDetailsSchema = new mongoose_1.Schema({
    tenantId: {
        type: String,
        required: true,
        unique: true,
        default: () => new mongoose_1.Types.ObjectId().toString() // Auto-generate tenant ID
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
            validator: function (v) {
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
            validator: function (v) {
                return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please provide a valid email address'
        }
    },
    password: {
        type: String,
        default: 'defaultpassword'
    },
    facilityType: {
        type: String,
        required: true
    },
    additionalInfo: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    settings: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
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
// Pre-save hook to set password same as email and hash it
facilityDetailsSchema.pre('save', async function (next) {
    try {
        // Set password to email if not already set
        if (this.email && (!this.password || this.password === 'defaultpassword')) {
            this.password = this.email;
        }
        // Hash the password if it's been modified
        if (this.isModified('password') && this.password) {
            const saltRounds = 12;
            this.password = await bcryptjs_1.default.hash(this.password, saltRounds);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
// Method to compare password
facilityDetailsSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false;
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
exports.FacilityDetails = (0, mongoose_1.model)('FacilityDetails', facilityDetailsSchema, 'facilityDetails');
