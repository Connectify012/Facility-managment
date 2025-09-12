import mongoose, { Document, Schema } from 'mongoose';

// Enum for IoT service categories
export enum IoTServiceCategory {
  ATTENDANCE_MANAGEMENT = 'Attendance Management',
  HK_GARDEN_PEST_MONITORING = 'HK/Garden/Pest Monitoring',
  ASSETS_MANAGEMENT = 'Assets Management',
  WATER_MANAGEMENT = 'Water Management',
  POWER_MANAGEMENT = 'Power Management',
  COMPLAINT_MANAGEMENT = 'Complaint Management'
}

// Enum for service status
export enum ServiceStatus {
  THIRD_PARTY_INTEGRATION_READY = 'Third-party Integration Ready',
  IOT_ENABLED = 'IoT Enabled',
  SETUP_REQUIRED = 'Setup Required',
  ACTIVE_MONITORING = 'Active Monitoring',
  REAL_TIME_DATA = 'Real-time Data',
  THIRD_PARTY_READY = 'Third-party Ready'
}

// Interface for individual IoT service item
export interface IIoTServiceItem {
  name: string;
  description: string;
  isActive: boolean;
  isAvailable: boolean;
  status: ServiceStatus;
  features: string[]; // Array of features this service provides
  integrationEndpoint?: string; // API endpoint for integration
  createdAt: Date;
  updatedAt: Date;
}

// Interface for IoT service category
export interface IIoTServiceCategoryDoc {
  category: IoTServiceCategory;
  activeCount: number;
  totalCount: number;
  services: IIoTServiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Main interface for IoT service management document
export interface IIoTServiceManagement extends Document {
  facilityId: mongoose.Types.ObjectId;
  facilityName: string;
  facilityType: string;
  serviceCategories: IIoTServiceCategoryDoc[];
  totalServicesAvailable: number;
  totalServicesActive: number;
  iotEnabled: boolean;
  lastUpdated: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  
  // Instance methods
  addServiceToCategory(
    categoryType: IoTServiceCategory,
    serviceData: Partial<IIoTServiceItem>
  ): Promise<IIoTServiceManagement>;
  
  updateServiceStatus(
    categoryType: IoTServiceCategory,
    serviceName: string,
    isActive: boolean
  ): Promise<IIoTServiceManagement>;
}

// Schema for individual IoT service item
const IoTServiceItemSchema = new Schema<IIoTServiceItem>({
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
  status: {
    type: String,
    enum: Object.values(ServiceStatus),
    default: ServiceStatus.SETUP_REQUIRED
  },
  features: [{
    type: String,
    trim: true
  }],
  integrationEndpoint: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Integration endpoint must be a valid URL'
    }
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

// Schema for IoT service category
const IoTServiceCategorySchema = new Schema<IIoTServiceCategoryDoc>({
  category: {
    type: String,
    enum: Object.values(IoTServiceCategory),
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
  services: [IoTServiceItemSchema],
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

// Main schema for IoT service management
const IoTServiceManagementSchema = new Schema<IIoTServiceManagement>({
  facilityId: {
    type: Schema.Types.ObjectId,
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
    trim: true
  },
  serviceCategories: [IoTServiceCategorySchema],
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
  iotEnabled: {
    type: Boolean,
    default: false,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user ID is required']
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
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
  collection: 'iotservicemanagement'
});

// Indexes for better query performance
IoTServiceManagementSchema.index({ facilityId: 1, isDeleted: 1 });
IoTServiceManagementSchema.index({ facilityType: 1, isDeleted: 1 });
IoTServiceManagementSchema.index({ 'serviceCategories.category': 1 });
IoTServiceManagementSchema.index({ 'serviceCategories.services.isActive': 1 });
IoTServiceManagementSchema.index({ iotEnabled: 1 });
IoTServiceManagementSchema.index({ createdAt: -1 });

// Pre-save middleware to update counts
IoTServiceManagementSchema.pre('save', function(next) {
  let totalAvailable = 0;
  let totalActive = 0;
  let hasActiveServices = false;

  this.serviceCategories.forEach((category: IIoTServiceCategoryDoc) => {
    const availableServices = category.services.filter((service: IIoTServiceItem) => service.isAvailable);
    const activeServices = category.services.filter((service: IIoTServiceItem) => service.isActive && service.isAvailable);
    
    category.totalCount = category.services.length;
    category.activeCount = activeServices.length;
    category.updatedAt = new Date();
    
    totalAvailable += availableServices.length;
    totalActive += activeServices.length;
    
    if (activeServices.length > 0) {
      hasActiveServices = true;
    }
  });

  this.totalServicesAvailable = totalAvailable;
  this.totalServicesActive = totalActive;
  this.iotEnabled = hasActiveServices;
  this.lastUpdated = new Date();
  
  next();
});

// Instance method to add a service to a category
IoTServiceManagementSchema.methods.addServiceToCategory = function(
  categoryType: IoTServiceCategory,
  serviceData: Partial<IIoTServiceItem>
) {
  const category = this.serviceCategories.find((cat: IIoTServiceCategoryDoc) => cat.category === categoryType);
  
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
  
  const targetCategory = this.serviceCategories.find((cat: IIoTServiceCategoryDoc) => cat.category === categoryType);
  
  const newService: IIoTServiceItem = {
    name: serviceData.name || '',
    description: serviceData.description || '',
    isActive: serviceData.isActive || false,
    isAvailable: serviceData.isAvailable !== undefined ? serviceData.isAvailable : true,
    status: serviceData.status || ServiceStatus.SETUP_REQUIRED,
    features: serviceData.features || [],
    integrationEndpoint: serviceData.integrationEndpoint,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  targetCategory!.services.push(newService);
  return this.save();
};

// Instance method to update service status
IoTServiceManagementSchema.methods.updateServiceStatus = function(
  categoryType: IoTServiceCategory,
  serviceName: string,
  isActive: boolean
) {
  const category = this.serviceCategories.find((cat: IIoTServiceCategoryDoc) => cat.category === categoryType);
  if (!category) {
    throw new Error(`Category ${categoryType} not found`);
  }
  
  const service = category.services.find((svc: IIoTServiceItem) => svc.name === serviceName);
  if (!service) {
    throw new Error(`Service ${serviceName} not found in category ${categoryType}`);
  }
  
  service.isActive = isActive;
  service.updatedAt = new Date();
  
  return this.save();
};

// Static method to initialize default IoT services for a facility
IoTServiceManagementSchema.statics.initializeDefaultIoTServices = function(
  facilityId: mongoose.Types.ObjectId,
  facilityName: string,
  facilityType: string,
  createdBy: mongoose.Types.ObjectId
) {
  const defaultIoTServices = {
    [IoTServiceCategory.ATTENDANCE_MANAGEMENT]: [
      { 
        name: 'Biometric System', 
        description: 'Enable IoT devices and integrations for automated service management and monitoring',
        icon: '👤',
        status: ServiceStatus.THIRD_PARTY_INTEGRATION_READY,
        features: ['Fingerprint scanning', 'Real-time attendance', 'Access control']
      },
      { 
        name: 'Face Check-in', 
        description: 'Facial recognition based attendance system',
        icon: '🔍',
        status: ServiceStatus.IOT_ENABLED,
        features: ['Face detection', 'Anti-spoofing', 'Temperature screening']
      },
      { 
        name: 'RFID Cards', 
        description: 'RFID card based access and attendance tracking',
        icon: '💳',
        status: ServiceStatus.SETUP_REQUIRED,
        features: ['Card scanning', 'Access management', 'Visitor tracking']
      }
    ],
    [IoTServiceCategory.HK_GARDEN_PEST_MONITORING]: [
      { 
        name: 'QR Code Scanning', 
        description: 'QR code based task verification and tracking',
        icon: '📱',
        status: ServiceStatus.IOT_ENABLED,
        features: ['Task verification', 'Location tracking', 'Progress monitoring']
      },
      { 
        name: 'Task Tracking', 
        description: 'Real-time monitoring of housekeeping and maintenance tasks',
        icon: '📋',
        status: ServiceStatus.IOT_ENABLED,
        features: ['Real-time updates', 'Task assignment', 'Completion tracking']
      },
      { 
        name: 'Schedule Automation', 
        description: 'Automated scheduling for maintenance and cleaning tasks',
        icon: '⏰',
        status: ServiceStatus.SETUP_REQUIRED,
        features: ['Auto scheduling', 'Resource optimization', 'Alert notifications']
      }
    ],
    [IoTServiceCategory.ASSETS_MANAGEMENT]: [
      { 
        name: 'Asset Tagging', 
        description: 'Digital tagging and tracking of facility assets',
        icon: '🏷️',
        status: ServiceStatus.SETUP_REQUIRED,
        features: ['Digital tags', 'Asset registry', 'Lifecycle tracking']
      },
      { 
        name: 'RFID Tracking', 
        description: 'RFID based asset location and movement tracking',
        icon: '📡',
        status: ServiceStatus.SETUP_REQUIRED,
        features: ['Location tracking', 'Movement alerts', 'Inventory management']
      },
      { 
        name: 'Maintenance Alerts', 
        description: 'Automated maintenance scheduling and alerts',
        icon: '🔧',
        status: ServiceStatus.IOT_ENABLED,
        features: ['Predictive maintenance', 'Alert system', 'Service scheduling']
      }
    ],
    [IoTServiceCategory.WATER_MANAGEMENT]: [
      { 
        name: 'Smart Water Meters', 
        description: 'IoT enabled water consumption monitoring',
        icon: '💧',
        status: ServiceStatus.IOT_ENABLED,
        features: ['Real-time monitoring', 'Consumption analytics', 'Leak detection']
      },
      { 
        name: 'Level Sensors', 
        description: 'Water tank level monitoring with IoT sensors',
        icon: '📊',
        status: ServiceStatus.SETUP_REQUIRED,
        features: ['Level monitoring', 'Overflow protection', 'Automated alerts']
      },
      { 
        name: 'Leak Detection', 
        description: 'IoT based water leak detection and prevention',
        icon: '🚨',
        status: ServiceStatus.ACTIVE_MONITORING,
        features: ['Early detection', 'Automated shutoff', 'Damage prevention']
      }
    ],
    [IoTServiceCategory.POWER_MANAGEMENT]: [
      { 
        name: 'Smart Power Meters', 
        description: 'Real-time power consumption monitoring',
        icon: '⚡',
        status: ServiceStatus.IOT_ENABLED,
        features: ['Real-time monitoring', 'Energy analytics', 'Cost optimization']
      },
      { 
        name: 'DG Monitoring', 
        description: 'Diesel generator monitoring and management',
        icon: '🔋',
        status: ServiceStatus.SETUP_REQUIRED,
        features: ['Performance monitoring', 'Fuel management', 'Maintenance alerts']
      },
      { 
        name: 'Energy Analytics', 
        description: 'Advanced energy consumption analytics and reporting',
        icon: '📈',
        status: ServiceStatus.REAL_TIME_DATA,
        features: ['Usage analytics', 'Cost analysis', 'Efficiency recommendations']
      }
    ],
    [IoTServiceCategory.COMPLAINT_MANAGEMENT]: [
      { 
        name: 'MyGate Integration', 
        description: 'Integration with MyGate for complaint management',
        icon: '🏠',
        status: ServiceStatus.IOT_ENABLED,
        features: ['Visitor management', 'Digital complaints', 'Community communication']
      },
      { 
        name: 'Adda Integration', 
        description: 'Integration with Adda platform for society management',
        icon: '🏢',
        status: ServiceStatus.SETUP_REQUIRED,
        features: ['Society management', 'Billing integration', 'Communication tools']
      },
      { 
        name: 'API Webhooks', 
        description: 'Custom API integrations for third-party complaint systems',
        icon: '🔗',
        status: ServiceStatus.THIRD_PARTY_READY,
        features: ['Custom integrations', 'Real-time sync', 'Webhook notifications']
      }
    ]
  };

  const serviceCategories = Object.entries(defaultIoTServices).map(([category, services]) => ({
    category: category as IoTServiceCategory,
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
    totalServicesAvailable: Object.values(defaultIoTServices).flat().length,
    totalServicesActive: 0,
    iotEnabled: false,
    createdBy,
    updatedBy: createdBy,
    isDeleted: false
  });
};

// Model interface with static methods
export interface IIoTServiceManagementModel extends mongoose.Model<IIoTServiceManagement> {
  initializeDefaultIoTServices(
    facilityId: mongoose.Types.ObjectId,
    facilityName: string,
    facilityType: string,
    createdBy: mongoose.Types.ObjectId
  ): Promise<IIoTServiceManagement>;
}

export const IoTServiceManagement = mongoose.model<IIoTServiceManagement, IIoTServiceManagementModel>('IoTServiceManagement', IoTServiceManagementSchema);
