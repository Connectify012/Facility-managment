"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceProvider = exports.ContractStatus = exports.ServiceCategory = void 0;
const mongoose_1 = require("mongoose");
// Service Category enum (matching ServiceManagement categories)
var ServiceCategory;
(function (ServiceCategory) {
    ServiceCategory["SOFT_SERVICES"] = "Soft Services";
    ServiceCategory["TECHNICAL_SERVICES"] = "Technical Services";
    ServiceCategory["AMCS"] = "AMCs";
    ServiceCategory["STATUTORY"] = "Statutory";
    ServiceCategory["SECURITY"] = "Security";
    ServiceCategory["ATTENDANCE"] = "Attendance";
})(ServiceCategory || (exports.ServiceCategory = ServiceCategory = {}));
// Contract Status enum
var ContractStatus;
(function (ContractStatus) {
    ContractStatus["ACTIVE"] = "Active";
    ContractStatus["PENDING"] = "Pending";
    ContractStatus["EXPIRED"] = "Expired";
})(ContractStatus || (exports.ContractStatus = ContractStatus = {}));
const serviceProviderSchema = new mongoose_1.Schema({
    facilityId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            validator: function (v) {
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
            validator: function (v) {
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
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
serviceProviderSchema.index({ facilityId: 1, providerName: 1, category: 1, isDeleted: 1 }, {
    unique: true,
    partialFilterExpression: { isDeleted: false }
});
// Virtual for contract duration
serviceProviderSchema.virtual('contractDuration').get(function () {
    if (this.contractStartDate && this.contractEndDate) {
        const diffTime = this.contractEndDate.getTime() - this.contractStartDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    return null;
});
// Virtual for contract remaining days
serviceProviderSchema.virtual('contractRemainingDays').get(function () {
    if (this.contractEndDate) {
        const diffTime = this.contractEndDate.getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }
    return null;
});
// Virtual for contract status based on dates
serviceProviderSchema.virtual('isContractExpired').get(function () {
    if (this.contractEndDate) {
        return new Date() > this.contractEndDate;
    }
    return false;
});
// Pre-save middleware to update contract status based on dates
serviceProviderSchema.pre('save', function (next) {
    if (this.contractEndDate && new Date() > this.contractEndDate) {
        this.contractStatus = ContractStatus.EXPIRED;
    }
    else if (this.contractStartDate && this.contractEndDate &&
        new Date() >= this.contractStartDate && new Date() <= this.contractEndDate) {
        this.contractStatus = ContractStatus.ACTIVE;
    }
    next();
});
// Static method to get providers by category
serviceProviderSchema.statics.getByCategory = function (facilityId, category) {
    return this.find({
        facilityId,
        category,
        isDeleted: false
    }).populate('createdBy', 'firstName lastName email');
};
// Static method to get active providers
serviceProviderSchema.statics.getActiveProviders = function (facilityId) {
    return this.find({
        facilityId,
        isActive: true,
        isDeleted: false,
        contractStatus: { $ne: ContractStatus.EXPIRED }
    }).populate('createdBy', 'firstName lastName email');
};
exports.ServiceProvider = (0, mongoose_1.model)('ServiceProvider', serviceProviderSchema, 'serviceProviders');
