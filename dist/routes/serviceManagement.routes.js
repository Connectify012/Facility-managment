"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceManagement_controller_1 = require("../controllers/serviceManagement.controller");
const rateLimiter_1 = require("../middleware/rateLimiter");
const serviceManagement_validation_1 = require("../validations/serviceManagement.validation");
const router = (0, express_1.Router)();
// Apply rate limiting to all routes
router.use(rateLimiter_1.generalLimiter);
/**
 * @swagger
 * /api/service-management/initialize:
 *   post:
 *     summary: Manually initialize services for a facility (for existing facilities without services)
 *     tags: [Service Management]
 *     description: This endpoint can be used to initialize services for existing facilities that don't have services yet.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - facilityId
 *               - facilityName
 *               - facilityType
 *               - createdBy
 *             properties:
 *               facilityId:
 *                 type: string
 *                 format: objectId
 *               facilityName:
 *                 type: string
 *               facilityType:
 *                 type: string
 *                 description: Type of facility (e.g., residential, commercial, industrial, corporate, mixed, etc.)
 *               createdBy:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       201:
 *         description: Services initialized successfully
 *       400:
 *         description: Bad request or validation error
 *       500:
 *         description: Internal server error
 */
router.post('/initialize', serviceManagement_validation_1.validateInitializeServices, serviceManagement_controller_1.ServiceManagementController.initializeServices);
/**
 * @swagger
 * /api/service-management:
 *   get:
 *     summary: Get all service management records with pagination
 *     tags: [Service Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: facilityType
 *         schema:
 *           type: string
 *           description: Type of facility to filter by (e.g., residential, commercial, industrial, corporate, mixed, etc.)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Soft Services, Technical Services, AMC Services]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: lastUpdated
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of service management records
 *       500:
 *         description: Internal server error
 */
router.get('/', serviceManagement_validation_1.validateServiceQuery, serviceManagement_controller_1.ServiceManagementController.getAllServices);
/**
 * @swagger
 * /api/service-management/facility/{facilityId}:
 *   get:
 *     summary: Get services by facility ID
 *     tags: [Service Management]
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Soft Services, Technical Services, AMC Services]
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: false
 *     responses:
 *       200:
 *         description: Services for the facility
 *       404:
 *         description: Services not found
 *       500:
 *         description: Internal server error
 */
router.get('/facility/:facilityId', serviceManagement_controller_1.ServiceManagementController.getServicesByFacilityId);
/**
 * @swagger
 * /api/service-management/facility/{facilityId}/add-service:
 *   post:
 *     summary: Add a new service to a category
 *     tags: [Service Management]
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - name
 *               - description
 *               - updatedBy
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [Soft Services, Technical Services, AMC Services]
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: false
 *               updatedBy:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       201:
 *         description: Service added successfully
 *       400:
 *         description: Bad request or validation error
 *       404:
 *         description: Services not found
 *       500:
 *         description: Internal server error
 */
router.post('/facility/:facilityId/add-service', serviceManagement_validation_1.validateAddServiceToCategory, serviceManagement_controller_1.ServiceManagementController.addServiceToCategory);
/**
 * @swagger
 * /api/service-management/facility/{facilityId}/update-status:
 *   patch:
 *     summary: Update service status (activate/deactivate)
 *     tags: [Service Management]
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - serviceName
 *               - isActive
 *               - updatedBy
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [Soft Services, Technical Services, AMC Services]
 *               serviceName:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               updatedBy:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       200:
 *         description: Service status updated successfully
 *       400:
 *         description: Bad request or validation error
 *       404:
 *         description: Service or services not found
 *       500:
 *         description: Internal server error
 */
router.patch('/facility/:facilityId/update-status', serviceManagement_validation_1.validateUpdateServiceStatus, serviceManagement_controller_1.ServiceManagementController.updateServiceStatus);
/**
 * @swagger
 * /api/service-management/facility/{facilityId}/update-details:
 *   patch:
 *     summary: Update service details (name, description)
 *     tags: [Service Management]
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - oldServiceName
 *               - updatedBy
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [Soft Services, Technical Services, AMC Services]
 *               oldServiceName:
 *                 type: string
 *               newServiceName:
 *                 type: string
 *               description:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       200:
 *         description: Service details updated successfully
 *       400:
 *         description: Bad request or validation error
 *       404:
 *         description: Service or services not found
 *       500:
 *         description: Internal server error
 */
router.patch('/facility/:facilityId/update-details', serviceManagement_validation_1.validateUpdateServiceDetails, serviceManagement_controller_1.ServiceManagementController.updateServiceDetails);
/**
 * @swagger
 * /api/service-management/facility/{facilityId}/remove-service:
 *   delete:
 *     summary: Remove service from category
 *     tags: [Service Management]
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - serviceName
 *               - updatedBy
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [Soft Services, Technical Services, AMC Services]
 *               serviceName:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       200:
 *         description: Service removed successfully
 *       400:
 *         description: Bad request or validation error
 *       404:
 *         description: Service or services not found
 *       500:
 *         description: Internal server error
 */
router.delete('/facility/:facilityId/remove-service', serviceManagement_validation_1.validateRemoveServiceFromCategory, serviceManagement_controller_1.ServiceManagementController.removeServiceFromCategory);
/**
 * @swagger
 * /api/service-management/facility/{facilityId}/bulk-update:
 *   patch:
 *     summary: Bulk update services
 *     tags: [Service Management]
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - services
 *               - updatedBy
 *             properties:
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                       enum: [Soft Services, Technical Services, AMC Services]
 *                     serviceName:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *               updatedBy:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       200:
 *         description: Services updated successfully
 *       400:
 *         description: Bad request or validation error
 *       404:
 *         description: Services not found
 *       500:
 *         description: Internal server error
 */
router.patch('/facility/:facilityId/bulk-update', serviceManagement_validation_1.validateBulkUpdateServices, serviceManagement_controller_1.ServiceManagementController.bulkUpdateServices);
/**
 * @swagger
 * /api/service-management/facility/{facilityId}/statistics:
 *   get:
 *     summary: Get service statistics for a facility
 *     tags: [Service Management]
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Service statistics
 *       404:
 *         description: Services not found
 *       500:
 *         description: Internal server error
 */
router.get('/facility/:facilityId/statistics', serviceManagement_controller_1.ServiceManagementController.getServiceStatistics);
/**
 * @swagger
 * /api/service-management/facility/{facilityId}:
 *   delete:
 *     summary: Delete service management (soft delete)
 *     tags: [Service Management]
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
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
 *                 format: objectId
 *     responses:
 *       200:
 *         description: Service management deleted successfully
 *       404:
 *         description: Services not found
 *       500:
 *         description: Internal server error
 */
router.delete('/facility/:facilityId', serviceManagement_validation_1.validateDeleteServiceManagement, serviceManagement_controller_1.ServiceManagementController.deleteServiceManagement);
/**
 * @swagger
 * /api/service-management/statistics/global:
 *   get:
 *     summary: Get global service statistics
 *     tags: [Service Management]
 *     responses:
 *       200:
 *         description: Global service statistics
 *       500:
 *         description: Internal server error
 */
router.get('/statistics/global', serviceManagement_controller_1.ServiceManagementController.getGlobalServiceStatistics);
/**
 * @swagger
 * /api/service-management/debug/{facilityId}:
 *   get:
 *     summary: Debug facility and service information
 *     tags: [Service Management]
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Debug information about facility and services
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Internal server error
 */
router.get('/debug/:facilityId', serviceManagement_controller_1.ServiceManagementController.debugFacilityServices);
exports.default = router;
