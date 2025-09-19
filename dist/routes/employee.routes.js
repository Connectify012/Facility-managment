"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_controller_1 = require("../controllers/employee.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: Employee ID
 *         email:
 *           type: string
 *           format: email
 *           description: Employee email address
 *         username:
 *           type: string
 *           description: Username (optional)
 *         firstName:
 *           type: string
 *           description: Employee first name
 *         lastName:
 *           type: string
 *           description: Employee last name
 *         phone:
 *           type: string
 *           description: Employee phone number
 *         role:
 *           type: string
 *           enum: [facility_manager, supervisor, technician, housekeeping, user, guest]
 *           description: Employee role (SUPER_ADMIN and ADMIN excluded from employee management)
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended, pending, blocked]
 *           description: Employee status
 *         verificationStatus:
 *           type: string
 *           enum: [pending, verified, rejected]
 *           description: Account verification status
 *         permissions:
 *           type: object
 *           description: Employee permissions
 *         profile:
 *           type: object
 *           description: Employee profile information
 *         settings:
 *           type: object
 *           description: Employee settings
 *         managedFacilities:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of facility IDs managed by employee
 *         createdBy:
 *           type: string
 *           description: ID of user who created this employee
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Employee creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Employee last update timestamp
 */
/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [facility_manager, supervisor, technician, housekeeping, user, guest]
 *                 description: Employee role (SUPER_ADMIN and ADMIN cannot be created through this endpoint)
 *               profile:
 *                 type: object
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Employee created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     employee:
 *                       $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Bad request - validation error
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post('/', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireManager, employee_controller_1.EmployeeController.createEmployee);
/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees with pagination and filtering
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of employees per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [facility_manager, supervisor, technician, housekeeping, user, guest]
 *         description: Filter by employee role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended, pending, blocked]
 *         description: Filter by employee status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in firstName, lastName, email, username
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     employees:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Employee'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireManager, employee_controller_1.EmployeeController.getAllEmployees);
/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     employee:
 *                       $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Invalid employee ID format
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireOwnershipOrAdmin, employee_controller_1.EmployeeController.getEmployeeById);
/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update employee (partial or full update)
 *     description: Update any combination of employee fields. You can update a single field or multiple fields at once. All fields are optional in the request body.
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Employee email address
 *               username:
 *                 type: string
 *                 description: Username (optional)
 *               firstName:
 *                 type: string
 *                 description: Employee first name
 *               lastName:
 *                 type: string
 *                 description: Employee last name
 *               phone:
 *                 type: string
 *                 description: Employee phone number
 *               role:
 *                 type: string
 *                 enum: [facility_manager, supervisor, technician, housekeeping, user, guest]
 *                 description: Employee role (cannot update to SUPER_ADMIN or ADMIN)
 *               profile:
 *                 type: object
 *                 description: Employee profile information (nested object with various fields)
 *                 properties:
 *                   employeeId:
 *                     type: string
 *                     description: Employee ID/Badge number
 *                   department:
 *                     type: string
 *                     description: Department name
 *                   jobTitle:
 *                     type: string
 *                     description: Job title/position
 *                   employmentStatus:
 *                     type: string
 *                     enum: [active, inactive, terminated, on_leave]
 *                     description: Employment status
 *                   workLocation:
 *                     type: string
 *                     enum: [on_site, remote, hybrid]
 *                     description: Work location type
 *                   hireDate:
 *                     type: string
 *                     format: date
 *                     description: Date of hire
 *                   employeeType:
 *                     type: string
 *                     enum: [permanent, contract, intern, temporary]
 *                     description: Employment type
 *                   probationEndDate:
 *                     type: string
 *                     format: date
 *                     description: End date of probation period
 *                   noticePeriod:
 *                     type: integer
 *                     description: Notice period in days
 *               managedFacilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of facility IDs managed by employee
 *               settings:
 *                 type: object
 *                 description: User preference settings
 *                 properties:
 *                   language:
 *                     type: string
 *                     description: Preferred language
 *                   timezone:
 *                     type: string
 *                     description: User timezone
 *           examples:
 *             updateSingleField:
 *               summary: Update only phone number
 *               value:
 *                 phone: "+1234567890"
 *             updateMultipleFields:
 *               summary: Update multiple basic fields
 *               value:
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 email: "jane.smith@company.com"
 *                 phone: "+1987654321"
 *             updateProfileInfo:
 *               summary: Update profile information
 *               value:
 *                 profile:
 *                   jobTitle: "Senior Facility Technician"
 *                   department: "Operations"
 *                   employmentStatus: "active"
 *             updateRole:
 *               summary: Update employee role
 *               value:
 *                 role: "supervisor"
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Employee updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     employee:
 *                       $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Bad request - validation error, email/username already exists, or invalid role
 *       403:
 *         description: Forbidden - cannot update to SUPER_ADMIN or ADMIN role
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireOwnershipOrAdmin, employee_controller_1.EmployeeController.updateEmployee);
/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete employee (soft delete)
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Employee deleted successfully
 *       400:
 *         description: Invalid employee ID format
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireSupervisor, employee_controller_1.EmployeeController.deleteEmployee);
/**
 * @swagger
 * /api/employees/{id}/restore:
 *   patch:
 *     summary: Restore deleted employee
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Employee restored successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     employee:
 *                       $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Invalid employee ID format
 *       404:
 *         description: Deleted employee not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/restore', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireSupervisor, employee_controller_1.EmployeeController.restoreEmployee);
/**
 * @swagger
 * /api/employees/{id}/status:
 *   patch:
 *     summary: Update employee status
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended, pending, blocked]
 *     responses:
 *       200:
 *         description: Employee status updated successfully
 *       400:
 *         description: Invalid status value or employee ID format
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/status', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireSupervisor, employee_controller_1.EmployeeController.updateEmployeeStatus);
/**
 * @swagger
 * /api/employees/{id}/role:
 *   patch:
 *     summary: Update employee role
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [facility_manager, supervisor, technician, housekeeping, user, guest]
 *     responses:
 *       200:
 *         description: Employee role updated successfully
 *       400:
 *         description: Invalid role value or employee ID format
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/role', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireSupervisor, employee_controller_1.EmployeeController.updateEmployeeRole);
/**
 * @swagger
 * /api/employees/role/{role}:
 *   get:
 *     summary: Get employees by role
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [facility_manager, supervisor, technician, housekeeping, user, guest]
 *         description: Employee role
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of employees per page
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *       400:
 *         description: Invalid role value
 *       500:
 *         description: Internal server error
 */
router.get('/role/:role', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireManager, employee_controller_1.EmployeeController.getEmployeesByRole);
/**
 * @swagger
 * /api/employees/{id}/password:
 *   patch:
 *     summary: Update employee password
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid request or current password incorrect
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/password', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireSupervisor, employee_controller_1.EmployeeController.updateEmployeePassword);
/**
 * @swagger
 * /api/employees/facility/{facilityId}:
 *   get:
 *     summary: Get employees by facility
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of employees per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [facility_manager, supervisor, technician, housekeeping, user, guest]
 *         description: Filter by employee role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended, pending, blocked]
 *         description: Filter by employee status
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     employees:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Invalid facility ID format
 *       500:
 *         description: Internal server error
 */
router.get('/facility/:facilityId', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireManager, employee_controller_1.EmployeeController.getEmployeesByFacility);
exports.default = router;
