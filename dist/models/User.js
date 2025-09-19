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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.WorkLocation = exports.ShiftType = exports.EmploymentStatus = exports.EmployeeType = exports.VerificationStatus = exports.UserStatus = exports.UserRole = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importStar(require("mongoose"));
// Enum for user roles
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["FACILITY_MANAGER"] = "facility_manager";
    UserRole["SUPERVISOR"] = "supervisor";
    UserRole["TECHNICIAN"] = "technician";
    UserRole["HOUSEKEEPING"] = "housekeeping";
    UserRole["USER"] = "user";
    UserRole["GUEST"] = "guest";
})(UserRole || (exports.UserRole = UserRole = {}));
// Enum for user status
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["PENDING"] = "pending";
    UserStatus["BLOCKED"] = "blocked";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
// Enum for account verification status
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "pending";
    VerificationStatus["VERIFIED"] = "verified";
    VerificationStatus["REJECTED"] = "rejected";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
// Enum for employee type
var EmployeeType;
(function (EmployeeType) {
    EmployeeType["PERMANENT"] = "permanent";
    EmployeeType["CONTRACT"] = "contract";
    EmployeeType["INTERN"] = "intern";
    EmployeeType["PART_TIME"] = "part_time";
    EmployeeType["FREELANCER"] = "freelancer";
    EmployeeType["CONSULTANT"] = "consultant";
})(EmployeeType || (exports.EmployeeType = EmployeeType = {}));
// Enum for employment status
var EmploymentStatus;
(function (EmploymentStatus) {
    EmploymentStatus["ACTIVE"] = "active";
    EmploymentStatus["TERMINATED"] = "terminated";
    EmploymentStatus["RESIGNED"] = "resigned";
    EmploymentStatus["RETIRED"] = "retired";
    EmploymentStatus["ON_LEAVE"] = "on_leave";
    EmploymentStatus["PROBATION"] = "probation";
})(EmploymentStatus || (exports.EmploymentStatus = EmploymentStatus = {}));
// Enum for shift types
var ShiftType;
(function (ShiftType) {
    ShiftType["MORNING"] = "morning";
    ShiftType["AFTERNOON"] = "afternoon";
    ShiftType["NIGHT"] = "night";
    ShiftType["FLEXIBLE"] = "flexible";
    ShiftType["ROTATIONAL"] = "rotational";
})(ShiftType || (exports.ShiftType = ShiftType = {}));
// Enum for work location
var WorkLocation;
(function (WorkLocation) {
    WorkLocation["ON_SITE"] = "on_site";
    WorkLocation["REMOTE"] = "remote";
    WorkLocation["HYBRID"] = "hybrid";
})(WorkLocation || (exports.WorkLocation = WorkLocation = {}));
// Default permissions based on role
const getDefaultPermissions = (role) => {
    const basePermissions = {
        canManageUsers: false,
        canManageFacilities: false,
        canManageServices: false,
        canManageIOT: false,
        canViewReports: false,
        canManageSettings: false,
        canManageBilling: false,
        canAccessAuditLogs: false,
        // Employee management permissions
        canManageEmployees: false,
        canViewEmployeeReports: false,
        canApproveLeaves: false,
        canManageAttendance: false,
        canManageShifts: false,
        canManagePayroll: false,
        canViewSalaryInfo: false,
        canManageDocuments: false,
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
                // Full employee management permissions
                canManageEmployees: true,
                canViewEmployeeReports: true,
                canApproveLeaves: true,
                canManageAttendance: true,
                canManageShifts: true,
                canManagePayroll: true,
                canViewSalaryInfo: true,
                canManageDocuments: true,
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
                canAccessAuditLogs: true,
                // Admin employee management permissions
                canManageEmployees: true,
                canViewEmployeeReports: true,
                canApproveLeaves: true,
                canManageAttendance: true,
                canManageShifts: true,
                canManagePayroll: true,
                canViewSalaryInfo: true,
                canManageDocuments: true
            };
        case UserRole.FACILITY_MANAGER:
            return {
                ...basePermissions,
                canManageFacilities: true,
                canManageServices: true,
                canManageIOT: true,
                canViewReports: true,
                // Facility manager employee permissions
                canManageEmployees: true,
                canViewEmployeeReports: true,
                canApproveLeaves: true,
                canManageAttendance: true,
                canManageShifts: true,
                canViewSalaryInfo: false, // No salary access
                canManageDocuments: true
            };
        case UserRole.SUPERVISOR:
            return {
                ...basePermissions,
                canManageServices: true,
                canManageIOT: true,
                canViewReports: true,
                // Supervisor employee permissions
                canManageEmployees: false,
                canViewEmployeeReports: true,
                canApproveLeaves: false, // Can't approve leaves
                canManageAttendance: true,
                canManageShifts: true,
                canViewSalaryInfo: false,
                canManageDocuments: false
            };
        case UserRole.TECHNICIAN:
            return {
                ...basePermissions,
                canManageIOT: true,
                canViewReports: true,
                // Technician permissions (minimal)
                canViewEmployeeReports: false,
                canManageAttendance: false, // Can only mark their own attendance
                canManageShifts: false
            };
        case UserRole.HOUSEKEEPING:
            return {
                ...basePermissions,
                canViewReports: true,
                // Housekeeping permissions (minimal)
                canViewEmployeeReports: false,
                canManageAttendance: false, // Can only mark their own attendance
                canManageShifts: false
            };
        case UserRole.USER:
            return {
                ...basePermissions,
                canViewReports: true
                // No employee management permissions for regular users
            };
        default:
            return basePermissions;
    }
};
// User Schema
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
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
            validator: function (v) {
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
            validator: function (v) {
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
        // Employee management permissions
        canManageEmployees: { type: Boolean, default: false },
        canViewEmployeeReports: { type: Boolean, default: false },
        canApproveLeaves: { type: Boolean, default: false },
        canManageAttendance: { type: Boolean, default: false },
        canManageShifts: { type: Boolean, default: false },
        canManagePayroll: { type: Boolean, default: false },
        canViewSalaryInfo: { type: Boolean, default: false },
        canManageDocuments: { type: Boolean, default: false },
        customPermissions: [{ type: String }]
    },
    profile: {
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
        hireDate: { type: Date },
        // Enhanced employee fields
        employeeType: {
            type: String,
            enum: Object.values(EmployeeType),
            default: EmployeeType.PERMANENT
        },
        employmentStatus: {
            type: String,
            enum: Object.values(EmploymentStatus),
            default: EmploymentStatus.ACTIVE
        },
        workLocation: {
            type: String,
            enum: Object.values(WorkLocation),
            default: WorkLocation.ON_SITE
        },
        shiftType: {
            type: String,
            enum: Object.values(ShiftType),
            default: ShiftType.MORNING
        },
        probationEndDate: { type: Date },
        confirmationDate: { type: Date },
        terminationDate: { type: Date },
        lastWorkingDay: { type: Date },
        noticePeriod: { type: Number, default: 30 }, // in days
        // Compensation & Benefits
        salary: {
            basic: { type: Number },
            currency: { type: String, default: 'INR' },
            payFrequency: {
                type: String,
                enum: ['monthly', 'weekly', 'bi_weekly', 'annual'],
                default: 'monthly'
            },
            effectiveDate: { type: Date }
        },
        // Work Schedule
        workSchedule: {
            workingDays: [{ type: String }], // ['monday', 'tuesday', etc.]
            startTime: { type: String, default: '09:00' }, // '09:00'
            endTime: { type: String, default: '18:00' }, // '18:00'
            breakDuration: { type: Number, default: 60 }, // in minutes
            weeklyHours: { type: Number, default: 40 }
        },
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
    managedFacilities: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'FacilityDetails'
        }],
    // Verification tokens
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    // Audit fields
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: { type: Date },
    deletedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
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
UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});
// Virtual for initials
UserSchema.virtual('initials').get(function () {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
});
// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ verificationStatus: 1 });
UserSchema.index({ isDeleted: 1 });
UserSchema.index({ managedFacilities: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'security.lastLoginAt': -1 });
// Employee-specific indexes
UserSchema.index({ 'profile.employeeId': 1 });
UserSchema.index({ 'profile.employmentStatus': 1 });
UserSchema.index({ 'profile.employeeType': 1 });
UserSchema.index({ 'profile.department': 1 });
UserSchema.index({ 'profile.hireDate': -1 });
// Text search index
UserSchema.index({
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    username: 'text',
    'profile.employeeId': 'text',
    'profile.department': 'text',
    'profile.jobTitle': 'text'
});
// Compound indexes
UserSchema.index({ role: 1, status: 1, isDeleted: 1 });
UserSchema.index({ 'profile.employmentStatus': 1, isDeleted: 1 });
UserSchema.index({ 'profile.department': 1, 'profile.employmentStatus': 1 });
// Pre-save middleware to hash password and set default permissions
UserSchema.pre('save', async function (next) {
    // Hash password if it's modified
    if (this.isModified('password')) {
        this.password = await bcryptjs_1.default.hash(this.password, 12);
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
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function () {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return token;
};
// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function () {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    return token;
};
// Update last login
UserSchema.methods.updateLastLogin = async function (ip) {
    this.security.lastLoginAt = new Date();
    if (ip)
        this.security.lastLoginIP = ip;
    this.security.failedLoginAttempts = 0;
    this.security.lockoutUntil = undefined;
    await this.save();
};
// Check if user has specific permission
UserSchema.methods.hasPermission = function (permission) {
    return this.permissions[permission] === true ||
        this.permissions.customPermissions.includes('all') ||
        this.permissions.customPermissions.includes(permission);
};
// Check if account is locked
UserSchema.methods.isAccountLocked = function () {
    return !!(this.security.lockoutUntil && this.security.lockoutUntil > new Date());
};
// Increment failed login attempts
UserSchema.methods.incrementFailedLogin = async function () {
    this.security.failedLoginAttempts += 1;
    // Lock account after 5 failed attempts for 30 minutes
    if (this.security.failedLoginAttempts >= 5) {
        this.security.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    await this.save();
};
// Reset failed login attempts
UserSchema.methods.resetFailedLogin = async function () {
    this.security.failedLoginAttempts = 0;
    this.security.lockoutUntil = undefined;
    await this.save();
};
// Add session token
UserSchema.methods.addSessionToken = async function (token, device, ip) {
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
UserSchema.methods.removeSessionToken = async function (token) {
    this.security.sessionTokens = this.security.sessionTokens.filter((sessionToken) => sessionToken.token !== token);
    await this.save();
};
// Clear all sessions
UserSchema.methods.clearAllSessions = async function () {
    this.security.sessionTokens = [];
    await this.save();
};
// Employee-specific methods
// Check if employee is active
UserSchema.methods.isActiveEmployee = function () {
    return this.profile?.employmentStatus === EmploymentStatus.ACTIVE &&
        this.status === UserStatus.ACTIVE;
};
// Check if employee is on probation
UserSchema.methods.isOnProbation = function () {
    return this.profile?.employmentStatus === EmploymentStatus.PROBATION ||
        (this.profile?.probationEndDate && this.profile.probationEndDate > new Date());
};
// Get employee tenure in days
UserSchema.methods.getTenureInDays = function () {
    if (!this.profile?.hireDate)
        return 0;
    const now = new Date();
    const hireDate = new Date(this.profile.hireDate);
    const diffTime = Math.abs(now.getTime() - hireDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
// Get employment status display
UserSchema.methods.getEmploymentStatusDisplay = function () {
    const status = this.profile?.employmentStatus || EmploymentStatus.ACTIVE;
    return status.replace('_', ' ').toUpperCase();
};
// Check if employee can approve leaves
UserSchema.methods.canApproveLeaves = function () {
    return this.permissions?.canApproveLeaves === true;
};
// Check if employee can manage other employees
UserSchema.methods.canManageEmployees = function () {
    return this.permissions?.canManageEmployees === true;
};
// Get employee work schedule
UserSchema.methods.getWorkSchedule = function () {
    return this.profile?.workSchedule || {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '09:00',
        endTime: '18:00',
        breakDuration: 60,
        weeklyHours: 40
    };
};
// Terminate employee
UserSchema.methods.terminateEmployee = async function (terminationDate, lastWorkingDay, reason) {
    this.profile = this.profile || {};
    this.profile.employmentStatus = EmploymentStatus.TERMINATED;
    this.profile.terminationDate = terminationDate;
    this.profile.lastWorkingDay = lastWorkingDay;
    this.status = UserStatus.INACTIVE;
    await this.save();
};
// Confirm employee (end probation)
UserSchema.methods.confirmEmployee = async function () {
    this.profile = this.profile || {};
    this.profile.employmentStatus = EmploymentStatus.ACTIVE;
    this.profile.confirmationDate = new Date();
    this.profile.probationEndDate = undefined;
    await this.save();
};
// Static method to find users by role
UserSchema.statics.findByRole = function (role) {
    return this.find({ role, isDeleted: false });
};
// Static method to find active users
UserSchema.statics.findActive = function () {
    return this.find({
        status: UserStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        isDeleted: false
    });
};
// Static method to create super admin
UserSchema.statics.createSuperAdmin = async function (userData) {
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
// Employee-specific static methods
// Find employees by employment status
UserSchema.statics.findByEmploymentStatus = function (status) {
    return this.find({
        'profile.employmentStatus': status,
        isDeleted: false
    });
};
// Find employees by employee type
UserSchema.statics.findByEmployeeType = function (type) {
    return this.find({
        'profile.employeeType': type,
        isDeleted: false
    });
};
// Find employees on probation
UserSchema.statics.findOnProbation = function () {
    return this.find({
        $or: [
            { 'profile.employmentStatus': EmploymentStatus.PROBATION },
            {
                'profile.probationEndDate': { $gt: new Date() },
                'profile.employmentStatus': EmploymentStatus.ACTIVE
            }
        ],
        isDeleted: false
    });
};
// Get employee statistics
UserSchema.statics.getEmployeeStats = async function () {
    return Promise.all([
        this.countDocuments({ isDeleted: false }),
        this.countDocuments({ 'profile.employmentStatus': EmploymentStatus.ACTIVE, isDeleted: false }),
        this.countDocuments({ 'profile.employmentStatus': EmploymentStatus.PROBATION, isDeleted: false }),
        this.countDocuments({ 'profile.employmentStatus': EmploymentStatus.TERMINATED, isDeleted: false }),
        this.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: '$profile.employeeType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ])
    ]).then(([total, active, probation, terminated, byType]) => ({
        total,
        active,
        probation,
        terminated,
        byType
    }));
};
exports.User = mongoose_1.default.model('User', UserSchema);
