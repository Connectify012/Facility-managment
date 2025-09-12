"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const iotServiceManagement_controller_1 = require("../controllers/iotServiceManagement.controller");
const rateLimiter_1 = require("../middleware/rateLimiter");
const iotServiceManagement_validation_1 = require("../validations/iotServiceManagement.validation");
const router = (0, express_1.Router)();
// Apply rate limiting to all routes
router.use(rateLimiter_1.generalLimiter);
/**
 * @swagger
 * /api/iot-service-management/initialize:
 *   post:
 *     summary: Initialize IoT services for a facility (DEPRECATED - IoT Services are auto-initialized when creating facility)
 *     tags: [IoT Service Management]
 *     deprecated: true
 *     description: This endpoint is deprecated. IoT services are now automatically initialized when a facility is created.
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
 *               createdBy:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       201:
 *         description: IoT services initialized successfully
 *       400:
 *         description: Bad request or validation error
 *       500:
 *         description: Internal server error
 */
// DEPRECATED: IoT services are now auto-initialized when creating facility
router.post('/initialize', iotServiceManagement_validation_1.validateInitializeIoTServices, iotServiceManagement_controller_1.IoTServiceManagementController.initializeIoTServices);
/**
 * @swagger
 * /api/iot-service-management:
 *   get:
 *     summary: Get all IoT service management records with pagination
 *     tags: [IoT Service Management]
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Attendance Management, HK/Garden/Pest Monitoring, Assets Management, Water Management, Power Management, Complaint Management]
 *       - in: query
 *         name: iotEnabled
 *         schema:
 *           type: string
 *           enum: [true, false]
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
 *         description: List of IoT service management records
 *       500:
 *         description: Internal server error
 */
router.get('/', iotServiceManagement_validation_1.validateIoTServiceQuery, iotServiceManagement_controller_1.IoTServiceManagementController.getAllIoTServices);
/**
 * @swagger
 * /api/iot-service-management/facility/{facilityId}:
 *   get:
 *     summary: Get IoT services by facility ID with auto-initialization
 *     tags: [IoT Service Management]
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
 *           enum: [Attendance Management, HK/Garden/Pest Monitoring, Assets Management, Water Management, Power Management, Complaint Management]
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: false
 *     responses:
 *       200:
 *         description: IoT services for the facility (auto-initialized if not exists)
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Internal server error
 */
router.get('/facility/:facilityId', iotServiceManagement_controller_1.IoTServiceManagementController.getIoTServicesByFacilityId);
/**
 * @swagger
 * /api/iot-service-management/facility/{facilityId}/add-service:
 *   post:
 *     summary: Add a new IoT service to a category
 *     tags: [IoT Service Management]
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
 *                 enum: [Attendance Management, HK/Garden/Pest Monitoring, Assets Management, Water Management, Power Management, Complaint Management]
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: false
 *               status:
 *                 type: string
 *                 enum: [Third-party Integration Ready, IoT Enabled, Setup Required, Active Monitoring, Real-time Data, Third-party Ready]
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               integrationEndpoint:
 *                 type: string
 *                 format: uri
 *               updatedBy:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       201:
 *         description: IoT service added successfully
 *       400:
 *         description: Bad request or validation error
 *       404:
 *         description: IoT services not found
 *       500:
 *         description: Internal server error
 */
router.post('/facility/:facilityId/add-service', iotServiceManagement_validation_1.validateAddIoTServiceToCategory, iotServiceManagement_controller_1.IoTServiceManagementController.addIoTServiceToCategory);
/**
 * @swagger
 * /api/iot-service-management/facility/{facilityId}/update-status:
 *   patch:
 *     summary: Update IoT service status (activate/deactivate)
 *     tags: [IoT Service Management]
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
 *                 enum: [Attendance Management, HK/Garden/Pest Monitoring, Assets Management, Water Management, Power Management, Complaint Management]
 *               serviceName:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               updatedBy:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       200:
 *         description: IoT service status updated successfully
 *       400:
 *         description: Bad request or validation error
 *       404:
 *         description: Service or IoT services not found
 *       500:
 *         description: Internal server error
 */
router.patch('/facility/:facilityId/update-status', iotServiceManagement_validation_1.validateUpdateIoTServiceStatus, iotServiceManagement_controller_1.IoTServiceManagementController.updateIoTServiceStatus);
/**
 * @swagger
 * /api/iot-service-management/facility/{facilityId}/update-details:
 *   patch:
 *     summary: Update IoT service details (name, description, status, etc.)
 *     tags: [IoT Service Management]
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
 *                 enum: [Attendance Management, HK/Garden/Pest Monitoring, Assets Management, Water Management, Power Management, Complaint Management]
 *               oldServiceName:
 *                 type: string
 *               newServiceName:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Third-party Integration Ready, IoT Enabled, Setup Required, Active Monitoring, Real-time Data, Third-party Ready]
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               integrationEndpoint:
 *                 type: string
 *                 format: uri
 *               updatedBy:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       200:
 *         description: IoT service details updated successfully
 *       400:
 *         description: Bad request or validation error
 *       404:
 *         description: Service or IoT services not found
 *       500:
 *         description: Internal server error
 */
router.patch('/facility/:facilityId/update-details', iotServiceManagement_validation_1.validateUpdateIoTServiceDetails, iotServiceManagement_controller_1.IoTServiceManagementController.updateIoTServiceDetails);
/**
 * @swagger
 * /api/iot-service-management/facility/{facilityId}/remove-service:
 *   delete:
 *     summary: Remove IoT service from category
 *     tags: [IoT Service Management]
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
 *                 enum: [Attendance Management, HK/Garden/Pest Monitoring, Assets Management, Water Management, Power Management, Complaint Management]
 *               serviceName:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       200:
 *         description: IoT service removed successfully
 *       400:
 *         description: Bad request or validation error
 *       404:
 *         description: Service or IoT services not found
 *       500:
 *         description: Internal server error
 */
router.delete('/facility/:facilityId/remove-service', iotServiceManagement_validation_1.validateRemoveIoTServiceFromCategory, iotServiceManagement_controller_1.IoTServiceManagementController.removeIoTServiceFromCategory);
/**
 * @swagger
 * /api/iot-service-management/facility/{facilityId}/bulk-update:
 *   patch:
 *     summary: Bulk update IoT services
 *     tags: [IoT Service Management]
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
 *                       enum: [Attendance Management, HK/Garden/Pest Monitoring, Assets Management, Water Management, Power Management, Complaint Management]
 *                     serviceName:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *               updatedBy:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       200:
 *         description: IoT services updated successfully
 *       400:
 *         description: Bad request or validation error
 *       404:
 *         description: IoT services not found
 *       500:
 *         description: Internal server error
 */
router.patch('/facility/:facilityId/bulk-update', iotServiceManagement_validation_1.validateBulkUpdateIoTServices, iotServiceManagement_controller_1.IoTServiceManagementController.bulkUpdateIoTServices);
/**
 * @swagger
 * /api/iot-service-management/facility/{facilityId}/statistics:
 *   get:
 *     summary: Get IoT service statistics for a facility
 *     tags: [IoT Service Management]
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: IoT service statistics
 *       404:
 *         description: IoT services not found
 *       500:
 *         description: Internal server error
 */
router.get('/facility/:facilityId/statistics', iotServiceManagement_controller_1.IoTServiceManagementController.getIoTServiceStatistics);
/**
 * @swagger
 * /api/iot-service-management/facility/{facilityId}:
 *   delete:
 *     summary: Delete IoT service management (soft delete)
 *     tags: [IoT Service Management]
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
 *         description: IoT service management deleted successfully
 *       404:
 *         description: IoT services not found
 *       500:
 *         description: Internal server error
 */
router.delete('/facility/:facilityId', iotServiceManagement_validation_1.validateDeleteIoTServiceManagement, iotServiceManagement_controller_1.IoTServiceManagementController.deleteIoTServiceManagement);
/**
 * @swagger
 * /api/iot-service-management/statistics/global:
 *   get:
 *     summary: Get global IoT service statistics
 *     tags: [IoT Service Management]
 *     responses:
 *       200:
 *         description: Global IoT service statistics including adoption rates
 *       500:
 *         description: Internal server error
 */
router.get('/statistics/global', iotServiceManagement_controller_1.IoTServiceManagementController.getGlobalIoTServiceStatistics);
exports.default = router;
