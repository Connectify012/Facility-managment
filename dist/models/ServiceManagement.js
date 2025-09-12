"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceManagement = exports.ServiceCategory = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Enum for service categories
var ServiceCategory;
(function (ServiceCategory) {
    ServiceCategory["SOFT_SERVICES"] = "Soft Services";
    ServiceCategory["TECHNICAL_SERVICES"] = "Technical Services";
    ServiceCategory["AMC_SERVICES"] = "AMC Services";
})(ServiceCategory || (exports.ServiceCategory = ServiceCategory = {}));
// Schema for individual service item
const ServiceItemSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Service description is required'],
        trim: true,
        maxlength: [500, 'Service description cannot exceed 500 characters']
    },
    isActive: {
        type: Boolean,
        default: false,
        index: true
    },
    isAvailable: {
        type: Boolean,
        default: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: true
});
// Schema for service category
const ServiceCategorySchema = new mongoose_1.Schema({
    category: {
        type: String,
        enum: Object.values(ServiceCategory),
        required: [true, 'Service category is required'],
        index: true
    },
    activeCount: {
        type: Number,
        default: 0,
        min: [0, 'Active count cannot be negative']
    },
    totalCount: {
        type: Number,
        default: 0,
        min: [0, 'Total count cannot be negative']
    },
    services: [ServiceItemSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: true
});
// Main schema for service management
const ServiceManagementSchema = new mongoose_1.Schema({
    facilityId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'FacilityDetails',
        required: [true, 'Facility ID is required'],
        index: true
    },
    facilityName: {
        type: String,
        required: [true, 'Facility name is required'],
        trim: true,
        maxlength: [200, 'Facility name cannot exceed 200 characters']
    },
    facilityType: {
        type: String,
        required: [true, 'Facility type is required'],
        trim: true,
        maxlength: [50, 'Facility type cannot exceed 50 characters'],
        index: true
    },
    serviceCategories: [ServiceCategorySchema],
    totalServicesAvailable: {
        type: Number,
        default: 0,
        min: [0, 'Total services available cannot be negative']
    },
    totalServicesActive: {
        type: Number,
        default: 0,
        min: [0, 'Total services active cannot be negative']
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by user ID is required']
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Updated by user ID is required']
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true,
    collection: 'servicemanagement'
});
// Indexes for better query performance
ServiceManagementSchema.index({ facilityId: 1, isDeleted: 1 });
ServiceManagementSchema.index({ facilityType: 1, isDeleted: 1 });
ServiceManagementSchema.index({ 'serviceCategories.category': 1 });
ServiceManagementSchema.index({ 'serviceCategories.services.isActive': 1 });
ServiceManagementSchema.index({ createdAt: -1 });
// Pre-save middleware to update counts
ServiceManagementSchema.pre('save', function (next) {
    let totalAvailable = 0;
    let totalActive = 0;
    this.serviceCategories.forEach((category) => {
        const availableServices = category.services.filter((service) => service.isAvailable);
        const activeServices = category.services.filter((service) => service.isActive && service.isAvailable);
        category.totalCount = category.services.length;
        category.activeCount = activeServices.length;
        category.updatedAt = new Date();
        totalAvailable += availableServices.length;
        totalActive += activeServices.length;
    });
    this.totalServicesAvailable = totalAvailable;
    this.totalServicesActive = totalActive;
    this.lastUpdated = new Date();
    next();
});
// Instance method to add a service to a category
ServiceManagementSchema.methods.addServiceToCategory = function (categoryType, serviceData) {
    const category = this.serviceCategories.find((cat) => cat.category === categoryType);
    if (!category) {
        // Create new category if it doesn't exist
        this.serviceCategories.push({
            category: categoryType,
            activeCount: 0,
            totalCount: 0,
            services: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
    const targetCategory = this.serviceCategories.find((cat) => cat.category === categoryType);
    const newService = {
        name: serviceData.name || '',
        description: serviceData.description || '',
        isActive: serviceData.isActive || false,
        isAvailable: serviceData.isAvailable !== undefined ? serviceData.isAvailable : true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    targetCategory.services.push(newService);
    return this.save();
};
// Instance method to update service status
ServiceManagementSchema.methods.updateServiceStatus = function (categoryType, serviceName, isActive) {
    const category = this.serviceCategories.find((cat) => cat.category === categoryType);
    if (!category) {
        throw new Error(`Category ${categoryType} not found`);
    }
    const service = category.services.find((svc) => svc.name === serviceName);
    if (!service) {
        throw new Error(`Service ${serviceName} not found in category ${categoryType}`);
    }
    service.isActive = isActive;
    service.updatedAt = new Date();
    return this.save();
};
// Static method to initialize default services for a facility
ServiceManagementSchema.statics.initializeDefaultServices = function (facilityId, facilityName, facilityType, createdBy) {
    const defaultServices = {
        [ServiceCategory.SOFT_SERVICES]: [
            { name: 'Housekeeping', description: 'Professional housekeeping services for your facility' },
            { name: 'Gardening', description: 'Professional gardening services for your facility' },
            { name: 'Pest Control', description: 'Professional pest control services for your facility' }
        ],
        [ServiceCategory.TECHNICAL_SERVICES]: [
            { name: 'Electrical', description: 'Professional electrical services for your facility' },
            { name: 'Plumbing', description: 'Professional plumbing services for your facility' },
            { name: 'STP', description: 'Professional stp services for your facility' },
            { name: 'WTP', description: 'Professional wtp services for your facility' },
            { name: 'Swimming Pool', description: 'Professional swimming pool services for your facility' },
            { name: 'HVAC', description: 'Professional hvac services for your facility' },
            { name: 'Firehydrant system', description: 'Professional firehydrant system services for your facility' }
        ],
        [ServiceCategory.AMC_SERVICES]: [
            { name: 'Lifts', description: 'Professional lifts services for your facility' },
            { name: 'DGs', description: 'Professional dgs services for your facility' },
            { name: 'Transformers', description: 'Professional transformers services for your facility' },
            { name: 'HNS pumps', description: 'Professional hns pumps services for your facility' },
            { name: 'Tank cleaning', description: 'Professional tank cleaning services for your facility' },
            { name: 'Fire extinguisher', description: 'Professional fire extinguisher services for your facility' },
            { name: 'CCTV', description: 'Professional cctv services for your facility' },
            { name: 'Gym', description: 'Professional gym services for your facility' }
        ]
    };
    const serviceCategories = Object.entries(defaultServices).map(([category, services]) => ({
        category: category,
        activeCount: 0,
        totalCount: services.length,
        services: services.map(service => ({
            ...service,
            isActive: false,
            isAvailable: true,
            createdAt: new Date(),
            updatedAt: new Date()
        })),
        createdAt: new Date(),
        updatedAt: new Date()
    }));
    return this.create({
        facilityId,
        facilityName,
        facilityType,
        serviceCategories,
        totalServicesAvailable: Object.values(defaultServices).flat().length,
        totalServicesActive: 0,
        createdBy,
        updatedBy: createdBy,
        isDeleted: false
    });
};
exports.ServiceManagement = mongoose_1.default.model('ServiceManagement', ServiceManagementSchema);
