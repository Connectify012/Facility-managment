import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose, { Document, Schema, Types } from 'mongoose';

// Enum for user roles
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  FACILITY_MANAGER = 'facility_manager',
  SUPERVISOR = 'supervisor',
  TECHNICIAN = 'technician',
  USER = 'user',
  GUEST = 'guest'
}

// Enum for user status
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  BLOCKED = 'blocked'
}

// Enum for account verification status
export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

// Interface for user permissions
export interface IUserPermissions {
  canManageUsers: boolean;
  canManageFacilities: boolean;
  canManageServices: boolean;
  canManageIOT: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageBilling: boolean;
  canAccessAuditLogs: boolean;
  customPermissions: string[];
}

// Interface for user profile
export interface IUserProfile {
  avatar?: string;
  bio?: string;
  dateOfBirth?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  department?: string;
  jobTitle?: string;
  employeeId?: string;
  hireDate?: Date;
}

// Interface for user settings
export interface IUserSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts';
    showEmail: boolean;
    showPhone: boolean;
  };
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
}

// Interface for user security
export interface IUserSecurity {
  lastPasswordChange: Date;
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  recoveryTokens?: string[];
  sessionTokens?: {
    token: string;
    createdAt: Date;
    expiresAt: Date;
    device?: string;
    ip?: string;
  }[];
}

// Main User interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  username?: string;
  password: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  verificationStatus: VerificationStatus;
  permissions: IUserPermissions;
  profile: IUserProfile;
  settings: IUserSettings;
  security: IUserSecurity;
  
  // Facility associations
  assignedFacilities: Types.ObjectId[];
  managedFacilities: Types.ObjectId[];
  
  // Organization data
  organizationId?: Types.ObjectId;
  departmentId?: Types.ObjectId;
  managerId?: Types.ObjectId;
  subordinates: Types.ObjectId[];
  
  // Verification tokens
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Audit fields
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  initials: string;
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
  updateLastLogin(ip?: string): Promise<void>;
  hasPermission(permission: keyof IUserPermissions): boolean;
  isAccountLocked(): boolean;
  incrementFailedLogin(): Promise<void>;
  resetFailedLogin(): Promise<void>;
  addSessionToken(token: string, device?: string, ip?: string): Promise<void>;
  removeSessionToken(token: string): Promise<void>;
  clearAllSessions(): Promise<void>;
}

// Default permissions based on role
const getDefaultPermissions = (role: UserRole): IUserPermissions => {
  const basePermissions: IUserPermissions = {
    canManageUsers: false,
    canManageFacilities: false,
    canManageServices: false,
    canManageIOT: false,
    canViewReports: false,
    canManageSettings: false,
    canManageBilling: false,
    canAccessAuditLogs: false,
    customPermissions: []
  };

  switch (role) {
    case UserRole.SUPER_ADMIN:
      return {
        canManageUsers: true,
        canManageFacilities: true,
        canManageServices: true,
        canManageIOT: true,
        canViewReports: true,
        canManageSettings: true,
        canManageBilling: true,
        canAccessAuditLogs: true,
        customPermissions: ['all']
      };
    
    case UserRole.ADMIN:
      return {
        ...basePermissions,
        canManageUsers: true,
        canManageFacilities: true,
        canManageServices: true,
        canManageIOT: true,
        canViewReports: true,
        canManageSettings: true,
        canManageBilling: true,
        canAccessAuditLogs: true
      };
    
    case UserRole.FACILITY_MANAGER:
      return {
        ...basePermissions,
        canManageFacilities: true,
        canManageServices: true,
        canManageIOT: true,
        canViewReports: true
      };
    
    case UserRole.SUPERVISOR:
      return {
        ...basePermissions,
        canManageServices: true,
        canManageIOT: true,
        canViewReports: true
      };
    
    case UserRole.TECHNICIAN:
      return {
        ...basePermissions,
        canManageIOT: true,
        canViewReports: true
      };
    
    case UserRole.USER:
      return {
        ...basePermissions,
        canViewReports: true
      };
    
    default:
      return basePermissions;
  }
};

// User Schema
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    validate: {
      validator: function(v: string) {
        return !v || /^[a-zA-Z0-9_.-]+$/.test(v);
      },
      message: 'Username can only contain letters, numbers, dots, dashes, and underscores'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
    required: [true, 'User role is required']
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.PENDING,
    required: [true, 'User status is required']
  },
  verificationStatus: {
    type: String,
    enum: Object.values(VerificationStatus),
    default: VerificationStatus.PENDING,
    required: [true, 'Verification status is required']
  },
  permissions: {
    canManageUsers: { type: Boolean, default: false },
    canManageFacilities: { type: Boolean, default: false },
    canManageServices: { type: Boolean, default: false },
    canManageIOT: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false },
    canManageBilling: { type: Boolean, default: false },
    canAccessAuditLogs: { type: Boolean, default: false },
    customPermissions: [{ type: String }]
  },
  profile: {
    avatar: { type: String },
    bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'] },
    dateOfBirth: { type: Date },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String }
    },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
      email: { type: String }
    },
    department: { type: String },
    jobTitle: { type: String },
    employeeId: { type: String },
    hireDate: { type: Date }
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: { 
        type: String, 
        enum: ['public', 'private', 'contacts'], 
        default: 'private' 
      },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false }
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' }
  },
  security: {
    lastPasswordChange: { type: Date, default: Date.now },
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date },
    lastLoginAt: { type: Date },
    lastLoginIP: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    recoveryTokens: [{ type: String, select: false }],
    sessionTokens: [{
      token: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, required: true },
      device: { type: String },
      ip: { type: String }
    }]
  },
  
  // Facility associations
  assignedFacilities: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'FacilityDetails' 
  }],
  managedFacilities: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'FacilityDetails' 
  }],
  
  // Organization data
  organizationId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization' 
  },
  departmentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Department' 
  },
  managerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  subordinates: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Verification tokens
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  
  // Audit fields
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { type: Date },
  deletedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.security?.twoFactorSecret;
      delete ret.security?.recoveryTokens;
      delete ret.security?.sessionTokens; // Remove session tokens from JSON response
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual for initials
UserSchema.virtual('initials').get(function() {
  return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ verificationStatus: 1 });
UserSchema.index({ isDeleted: 1 });
UserSchema.index({ assignedFacilities: 1 });
UserSchema.index({ managedFacilities: 1 });
UserSchema.index({ organizationId: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'security.lastLoginAt': -1 });

// Text search index
UserSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  username: 'text'
});

// Compound indexes
UserSchema.index({ role: 1, status: 1, isDeleted: 1 });
UserSchema.index({ organizationId: 1, role: 1, isDeleted: 1 });

// Pre-save middleware to hash password and set default permissions
UserSchema.pre('save', async function(next) {
  // Hash password if it's modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.security.lastPasswordChange = new Date();
  }
  
  // Set default permissions based on role if not already set
  if (this.isModified('role') || this.isNew) {
    const defaultPermissions = getDefaultPermissions(this.role);
    this.permissions = { ...defaultPermissions, ...this.permissions };
  }
  
  next();
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function(): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function(): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return token;
};

// Update last login
UserSchema.methods.updateLastLogin = async function(ip?: string): Promise<void> {
  this.security.lastLoginAt = new Date();
  if (ip) this.security.lastLoginIP = ip;
  this.security.failedLoginAttempts = 0;
  this.security.lockoutUntil = undefined;
  await this.save();
};

// Check if user has specific permission
UserSchema.methods.hasPermission = function(permission: keyof IUserPermissions): boolean {
  return this.permissions[permission] === true || 
         this.permissions.customPermissions.includes('all') ||
         this.permissions.customPermissions.includes(permission);
};

// Check if account is locked
UserSchema.methods.isAccountLocked = function(): boolean {
  return !!(this.security.lockoutUntil && this.security.lockoutUntil > new Date());
};

// Increment failed login attempts
UserSchema.methods.incrementFailedLogin = async function(): Promise<void> {
  this.security.failedLoginAttempts += 1;
  
  // Lock account after 5 failed attempts for 30 minutes
  if (this.security.failedLoginAttempts >= 5) {
    this.security.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
  
  await this.save();
};

// Reset failed login attempts
UserSchema.methods.resetFailedLogin = async function(): Promise<void> {
  this.security.failedLoginAttempts = 0;
  this.security.lockoutUntil = undefined;
  await this.save();
};

// Add session token
UserSchema.methods.addSessionToken = async function(token: string, device?: string, ip?: string): Promise<void> {
  const sessionToken = {
    token,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    device,
    ip
  };
  
  this.security.sessionTokens.push(sessionToken);
  
  // Keep only last 5 sessions
  if (this.security.sessionTokens.length > 5) {
    this.security.sessionTokens = this.security.sessionTokens.slice(-5);
  }
  
  await this.save();
};

// Remove session token
UserSchema.methods.removeSessionToken = async function(token: string): Promise<void> {
  this.security.sessionTokens = this.security.sessionTokens.filter(
    (sessionToken: any) => sessionToken.token !== token
  );
  await this.save();
};

// Clear all sessions
UserSchema.methods.clearAllSessions = async function(): Promise<void> {
  this.security.sessionTokens = [];
  await this.save();
};

// Static method to find users by role
UserSchema.statics.findByRole = function(role: UserRole) {
  return this.find({ role, isDeleted: false });
};

// Static method to find active users
UserSchema.statics.findActive = function() {
  return this.find({ 
    status: UserStatus.ACTIVE, 
    verificationStatus: VerificationStatus.VERIFIED,
    isDeleted: false 
  });
};

// Static method to create super admin
UserSchema.statics.createSuperAdmin = async function(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const existingSuperAdmin = await this.findOne({ role: UserRole.SUPER_ADMIN, isDeleted: false });
  
  if (existingSuperAdmin) {
    throw new Error('Super admin already exists');
  }
  
  return this.create({
    ...userData,
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    verificationStatus: VerificationStatus.VERIFIED,
    permissions: getDefaultPermissions(UserRole.SUPER_ADMIN)
  });
};

// Model interface with static methods
export interface IUserModel extends mongoose.Model<IUser> {
  findByRole(role: UserRole): mongoose.Query<IUser[], IUser>;
  findActive(): mongoose.Query<IUser[], IUser>;
  createSuperAdmin(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<IUser>;
}

export const User = mongoose.model<IUser, IUserModel>('User', UserSchema);