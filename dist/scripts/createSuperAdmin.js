#!/usr/bin/env node
"use strict";
/**
 * Create Super Admin User Script
 *
 * This script creates a super admin user for the facility management system.
 * Run this script to set up the initial admin user.
 *
 * Usage:
 * npm run create-superadmin
 * or
 * node dist/scripts/createSuperAdmin.js
 * or
 * ts-node src/scripts/createSuperAdmin.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const readline_1 = __importDefault(require("readline"));
const User_1 = require("../models/User");
// Load environment variables
dotenv_1.default.config();
// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
};
// Create readline interface
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
// Helper function to ask questions
const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
};
// Helper function to ask for password (hidden input)
const askPassword = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
};
// Validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
// Validate password strength
const validatePassword = (password) => {
    const messages = [];
    if (password.length < 8) {
        messages.push('Password must be at least 8 characters long');
    }
    if (!/[a-z]/.test(password)) {
        messages.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
        messages.push('Password must contain at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
        messages.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        messages.push('Password must contain at least one special character');
    }
    return {
        isValid: messages.length === 0,
        messages
    };
};
// Connect to MongoDB
const connectToDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/facility';
        console.log(`${colors.blue}Connecting to MongoDB...${colors.reset}`);
        await mongoose_1.default.connect(mongoUri);
        console.log(`${colors.green}✓ Connected to MongoDB successfully${colors.reset}`);
    }
    catch (error) {
        console.error(`${colors.red}✗ Failed to connect to MongoDB:${colors.reset}`, error);
        process.exit(1);
    }
};
// Check if super admin already exists
const checkExistingSuperAdmin = async () => {
    try {
        const existingSuperAdmin = await User_1.User.findOne({
            role: User_1.UserRole.SUPER_ADMIN,
            isDeleted: false
        });
        return !!existingSuperAdmin;
    }
    catch (error) {
        console.error(`${colors.red}✗ Error checking for existing super admin:${colors.reset}`, error);
        return false;
    }
};
// Collect super admin data from user input
const collectSuperAdminData = async () => {
    console.log(`\n${colors.cyan}Please provide the super admin details:${colors.reset}\n`);
    // Get email
    let email;
    while (true) {
        email = await askQuestion('Email address: ');
        if (!email) {
            console.log(`${colors.red}Email is required. Please try again.${colors.reset}`);
            continue;
        }
        if (!validateEmail(email)) {
            console.log(`${colors.red}Please provide a valid email address.${colors.reset}`);
            continue;
        }
        // Check if email already exists
        try {
            const existingUser = await User_1.User.findOne({
                email: email.toLowerCase(),
                isDeleted: false
            });
            if (existingUser) {
                console.log(`${colors.red}A user with this email already exists. Please use a different email.${colors.reset}`);
                continue;
            }
        }
        catch (error) {
            console.error(`${colors.red}Error checking email:${colors.reset}`, error);
            continue;
        }
        break;
    }
    // Get first name
    let firstName;
    while (true) {
        firstName = await askQuestion('First name: ');
        if (!firstName) {
            console.log(`${colors.red}First name is required. Please try again.${colors.reset}`);
            continue;
        }
        if (firstName.length < 2 || firstName.length > 50) {
            console.log(`${colors.red}First name must be between 2 and 50 characters.${colors.reset}`);
            continue;
        }
        break;
    }
    // Get last name
    let lastName;
    while (true) {
        lastName = await askQuestion('Last name: ');
        if (!lastName) {
            console.log(`${colors.red}Last name is required. Please try again.${colors.reset}`);
            continue;
        }
        if (lastName.length < 2 || lastName.length > 50) {
            console.log(`${colors.red}Last name must be between 2 and 50 characters.${colors.reset}`);
            continue;
        }
        break;
    }
    // Get password
    let password;
    while (true) {
        password = await askPassword('Password (min 8 chars, must include uppercase, lowercase, number, and special char): ');
        if (!password) {
            console.log(`${colors.red}Password is required. Please try again.${colors.reset}`);
            continue;
        }
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            console.log(`${colors.red}Password requirements not met:${colors.reset}`);
            passwordValidation.messages.forEach(msg => {
                console.log(`${colors.red}  - ${msg}${colors.reset}`);
            });
            continue;
        }
        // Confirm password
        const confirmPassword = await askPassword('Confirm password: ');
        if (password !== confirmPassword) {
            console.log(`${colors.red}Passwords do not match. Please try again.${colors.reset}`);
            continue;
        }
        break;
    }
    // Get phone (optional)
    const phone = await askQuestion('Phone number (optional): ');
    return {
        email: email.toLowerCase(),
        firstName,
        lastName,
        password,
        phone: phone || undefined
    };
};
// Create the super admin user
const createSuperAdmin = async (userData) => {
    try {
        console.log(`\n${colors.blue}Creating super admin user...${colors.reset}`);
        const superAdmin = new User_1.User({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: userData.password,
            phone: userData.phone,
            role: User_1.UserRole.SUPER_ADMIN,
            status: User_1.UserStatus.ACTIVE,
            verificationStatus: User_1.VerificationStatus.VERIFIED,
            profile: {
                jobTitle: 'Super Administrator',
                department: 'Administration'
            },
            settings: {
                notifications: {
                    email: true,
                    sms: false,
                    push: true,
                    inApp: true
                },
                privacy: {
                    profileVisibility: 'private',
                    showEmail: false,
                    showPhone: false
                },
                language: 'en',
                timezone: 'UTC',
                theme: 'light'
            }
        });
        await superAdmin.save();
        console.log(`${colors.green}✓ Super admin user created successfully!${colors.reset}`);
        console.log(`\n${colors.cyan}Super Admin Details:${colors.reset}`);
        console.log(`${colors.white}ID: ${superAdmin._id}${colors.reset}`);
        console.log(`${colors.white}Email: ${superAdmin.email}${colors.reset}`);
        console.log(`${colors.white}Name: ${superAdmin.firstName} ${superAdmin.lastName}${colors.reset}`);
        console.log(`${colors.white}Role: ${superAdmin.role}${colors.reset}`);
        console.log(`${colors.white}Status: ${superAdmin.status}${colors.reset}`);
        console.log(`${colors.white}Created: ${superAdmin.createdAt}${colors.reset}`);
    }
    catch (error) {
        console.error(`${colors.red}✗ Failed to create super admin user:${colors.reset}`, error);
        throw error;
    }
};
// Display help information
const showHelp = () => {
    console.log(`\n${colors.cyan}Create Super Admin User Script${colors.reset}`);
    console.log(`${colors.white}================================${colors.reset}\n`);
    console.log(`${colors.yellow}This script creates a super admin user for the facility management system.${colors.reset}\n`);
    console.log(`${colors.white}Requirements:${colors.reset}`);
    console.log(`${colors.white}  - Valid email address${colors.reset}`);
    console.log(`${colors.white}  - Strong password (min 8 chars, uppercase, lowercase, number, special char)${colors.reset}`);
    console.log(`${colors.white}  - First and last name${colors.reset}\n`);
    console.log(`${colors.white}The super admin will have full access to all system features.${colors.reset}\n`);
};
// Main function
const main = async () => {
    try {
        console.log(`${colors.magenta}=====================================`);
        console.log(`  FACILITY MANAGEMENT SYSTEM`);
        console.log(`  Super Admin User Creator`);
        console.log(`=====================================`);
        console.log(`${colors.reset}`);
        // Check for help flag
        if (process.argv.includes('--help') || process.argv.includes('-h')) {
            showHelp();
            process.exit(0);
        }
        // Connect to database
        await connectToDatabase();
        // Check if super admin already exists
        const superAdminExists = await checkExistingSuperAdmin();
        if (superAdminExists) {
            console.log(`${colors.yellow}⚠ A super admin user already exists in the system.${colors.reset}`);
            const overwrite = await askQuestion('Do you want to create another super admin? (y/N): ');
            if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                console.log(`${colors.blue}Operation cancelled.${colors.reset}`);
                process.exit(0);
            }
        }
        // Collect user data
        const userData = await collectSuperAdminData();
        // Confirm creation
        console.log(`\n${colors.cyan}Please confirm the details:${colors.reset}`);
        console.log(`${colors.white}Email: ${userData.email}${colors.reset}`);
        console.log(`${colors.white}Name: ${userData.firstName} ${userData.lastName}${colors.reset}`);
        console.log(`${colors.white}Phone: ${userData.phone || 'Not provided'}${colors.reset}`);
        console.log(`${colors.white}Role: Super Admin${colors.reset}`);
        const confirm = await askQuestion('\nDo you want to create this super admin user? (y/N): ');
        if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
            console.log(`${colors.blue}Operation cancelled.${colors.reset}`);
            process.exit(0);
        }
        // Create super admin
        await createSuperAdmin(userData);
        console.log(`\n${colors.green}🎉 Super admin user setup completed successfully!${colors.reset}`);
        console.log(`${colors.yellow}You can now use this account to log in to the system.${colors.reset}\n`);
    }
    catch (error) {
        console.error(`${colors.red}✗ Script failed:${colors.reset}`, error);
        process.exit(1);
    }
    finally {
        // Close connections
        rl.close();
        await mongoose_1.default.disconnect();
        console.log(`${colors.blue}Database connection closed.${colors.reset}`);
    }
};
// Handle process termination
process.on('SIGINT', async () => {
    console.log(`\n${colors.yellow}Process interrupted by user.${colors.reset}`);
    rl.close();
    await mongoose_1.default.disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log(`\n${colors.yellow}Process terminated.${colors.reset}`);
    rl.close();
    await mongoose_1.default.disconnect();
    process.exit(0);
});
// Run the script
if (require.main === module) {
    main().catch((error) => {
        console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
        process.exit(1);
    });
}
exports.default = main;
