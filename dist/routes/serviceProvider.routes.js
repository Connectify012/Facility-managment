"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceProvider_controller_1 = require("../controllers/serviceProvider.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceProvider:
 *       type: object
 *       required:
 *         - facilityId
 *         - providerName
 *         - category
 *         - contactPerson
 *         - phone
 *         - email
 *         - contractStatus
 *         - createdBy
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the service provider
 *         facilityId:
 *           type: string
 *           description: ID of the facility this provider serves
 *         providerName:
 *           type: string
 *           description: Name of the service provider company
 *         category:
 *           type: string
 *           enum: [Soft Services, Technical Services, AMCs, Statutory, Security, Attendance]
 *           description: Service category
 *         contactPerson:
 *           type: string
 *           description: Name of the contact person
 *         phone:
 *           type: string
 *           description: Contact phone number
 *         email:
 *           type: string
 *           description: Contact email address
 *         contractStatus:
 *           type: string
 *           enum: [Active, Pending, Expired]
 *           description: Current contract status
 *         contractStartDate:
 *           type: string
 *           format: date
 *           description: Contract start date
 *         contractEndDate:
 *           type: string
 *           format: date
 *           description: Contract end date
 *         services:
 *           type: array
 *           items:
 *             type: string
 *           description: List of services provided
 *         description:
 *           type: string
 *           description: Provider description
 *         address:
 *           type: string
 *           description: Provider address
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           description: Provider rating
 *         isActive:
 *           type: boolean
 *           description: Whether the provider is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @swagger
 * /api/service-providers/{facilityId}:
 *   post:
 *     summary: Create a new service provider
 *     tags: [Service Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - providerName
 *               - category
 *               - contactPerson
 *               - phone
 *               - email
 *               - contractStatus
 *               - createdBy
 *             properties:
 *               providerName:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Soft Services, Technical Services, AMCs, Statutory, Security, Attendance]
 *               contactPerson:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               contractStatus:
 *                 type: string
 *                 enum: [Active, Pending, Expired]
 *               contractStartDate:
 *                 type: string
 *                 format: date
 *               contractEndDate:
 *                 type: string
 *                 format: date
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               createdBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service provider created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     serviceProvider:
 *                       $ref: '#/components/schemas/ServiceProvider'
 *       400:
 *         description: Bad request
 *       409:
 *         description: Provider already exists
 */
router.post('/:facilityId', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.authorize(User_1.UserRole.SUPER_ADMIN, User_1.UserRole.ADMIN, User_1.UserRole.FACILITY_MANAGER), serviceProvider_controller_1.ServiceProviderController.createServiceProvider);
/**
 * @swagger
 * /api/service-providers/{facilityId}:
 *   get:
 *     summary: Get all service providers for a facility
 *     tags: [Service Providers]
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
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Soft Services, Technical Services, AMCs, Statutory, Security, Attendance]
 *         description: Filter by category
 *       - in: query
 *         name: contractStatus
 *         schema:
 *           type: string
 *           enum: [Active, Pending, Expired]
 *         description: Filter by contract status
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in provider name, contact person, email, description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Service providers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     serviceProviders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ServiceProvider'
 *                     pagination:
 *                       type: object
 */
router.get('/:facilityId', auth_middleware_1.AuthMiddleware.authenticate, serviceProvider_controller_1.ServiceProviderController.getAllServiceProviders);
/**
 * @swagger
 * /api/service-providers/{facilityId}/active:
 *   get:
 *     summary: Get active service providers for a facility
 *     tags: [Service Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *     responses:
 *       200:
 *         description: Active service providers retrieved successfully
 */
router.get('/:facilityId/active', auth_middleware_1.AuthMiddleware.authenticate, serviceProvider_controller_1.ServiceProviderController.getActiveServiceProviders);
/**
 * @swagger
 * /api/service-providers/{facilityId}/category/{category}:
 *   get:
 *     summary: Get service providers by category
 *     tags: [Service Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Soft Services, Technical Services, AMCs, Statutory, Security, Attendance]
 *         description: Service category
 *     responses:
 *       200:
 *         description: Service providers by category retrieved successfully
 */
router.get('/:facilityId/category/:category', auth_middleware_1.AuthMiddleware.authenticate, serviceProvider_controller_1.ServiceProviderController.getServiceProvidersByCategory);
/**
 * @swagger
 * /api/service-providers/{facilityId}/search:
 *   get:
 *     summary: Search service providers
 *     tags: [Service Providers]
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
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Soft Services, Technical Services, AMCs, Statutory, Security, Attendance]
 *         description: Filter by category
 *       - in: query
 *         name: contractStatus
 *         schema:
 *           type: string
 *           enum: [Active, Pending, Expired]
 *         description: Filter by contract status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get('/:facilityId/search', auth_middleware_1.AuthMiddleware.authenticate, serviceProvider_controller_1.ServiceProviderController.searchServiceProviders);
/**
 * @swagger
 * /api/service-providers/{facilityId}/statistics:
 *   get:
 *     summary: Get service provider statistics for a facility
 *     tags: [Service Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/:facilityId/statistics', auth_middleware_1.AuthMiddleware.authenticate, serviceProvider_controller_1.ServiceProviderController.getServiceProviderStatistics);
/**
 * @swagger
 * /api/service-providers/provider/{id}:
 *   get:
 *     summary: Get service provider by ID
 *     tags: [Service Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service provider ID
 *     responses:
 *       200:
 *         description: Service provider retrieved successfully
 *       404:
 *         description: Service provider not found
 */
router.get('/provider/:id', auth_middleware_1.AuthMiddleware.authenticate, serviceProvider_controller_1.ServiceProviderController.getServiceProviderById);
/**
 * @swagger
 * /api/service-providers/provider/{id}:
 *   put:
 *     summary: Update service provider
 *     tags: [Service Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service provider ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - updatedBy
 *             properties:
 *               providerName:
 *                 type: string
 *               category:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               contractStatus:
 *                 type: string
 *               contractStartDate:
 *                 type: string
 *                 format: date
 *               contractEndDate:
 *                 type: string
 *                 format: date
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               rating:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               updatedBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service provider updated successfully
 *       404:
 *         description: Service provider not found
 */
router.put('/provider/:id', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.authorize(User_1.UserRole.SUPER_ADMIN, User_1.UserRole.ADMIN, User_1.UserRole.FACILITY_MANAGER), serviceProvider_controller_1.ServiceProviderController.updateServiceProvider);
/**
 * @swagger
 * /api/service-providers/provider/{id}:
 *   delete:
 *     summary: Delete service provider (soft delete)
 *     tags: [Service Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service provider ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - updatedBy
 *             properties:
 *               updatedBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service provider deleted successfully
 *       404:
 *         description: Service provider not found
 */
router.delete('/provider/:id', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.authorize(User_1.UserRole.SUPER_ADMIN, User_1.UserRole.ADMIN, User_1.UserRole.FACILITY_MANAGER), serviceProvider_controller_1.ServiceProviderController.deleteServiceProvider);
/**
 * @swagger
 * /api/service-providers/{facilityId}/bulk-update:
 *   patch:
 *     summary: Bulk update service providers
 *     tags: [Service Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - providers
 *               - updatedBy
 *             properties:
 *               providers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     providerId:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     contractStatus:
 *                       type: string
 *               updatedBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bulk update completed
 */
router.patch('/:facilityId/bulk-update', auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.authorize(User_1.UserRole.SUPER_ADMIN, User_1.UserRole.ADMIN, User_1.UserRole.FACILITY_MANAGER), serviceProvider_controller_1.ServiceProviderController.bulkUpdateServiceProviders);
exports.default = router;
