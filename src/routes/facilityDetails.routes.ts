import { Router } from 'express';
import { FacilityDetailsController } from '../controllers/facilityDetails.controller';
import {
    validateBulkCreateFacilities,
    validateCreateFacility,
    validateFacilityQuery,
    validateUpdateFacility
} from '../validations/facilityDetails.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Facility Details
 *   description: Facility management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FacilityDetails:
 *       type: object
 *       required:
 *         - siteName
 *         - city
 *         - location
 *         - clientName
 *         - position
 *         - contactNo
 *         - facilityType
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated facility ID
 *         tenantId:
 *           type: string
 *           description: Auto-generated tenant ID
 *         siteName:
 *           type: string
 *           description: Name of the facility site
 *           maxLength: 100
 *         city:
 *           type: string
 *           description: City where facility is located
 *           maxLength: 50
 *         location:
 *           type: string
 *           description: Full address of the facility
 *           maxLength: 200
 *         clientName:
 *           type: string
 *           description: Name of the client
 *           maxLength: 100
 *         position:
 *           type: string
 *           description: Position/designation
 *           maxLength: 100
 *         contactNo:
 *           type: string
 *           description: Contact phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Email address (optional)
 *         facilityType:
 *           type: string
 *           enum: [residential, corporate, industrial, hospitality]
 *           description: Type of facility
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         tenantId: "507f1f77bcf86cd799439012"
 *         siteName: "Downtown Office Complex"
 *         city: "New York"
 *         location: "123 Main Street, Downtown, NY 10001"
 *         clientName: "John Doe"
 *         position: "Facility Manager"
 *         contactNo: "+1-555-123-4567"
 *         email: "john.doe@example.com"
 *         facilityType: "corporate"
 *         createdAt: "2025-09-12T10:30:00Z"
 *         updatedAt: "2025-09-12T10:30:00Z"
 */

/**
 * @swagger
 * /api/facilities:
 *   get:
 *     summary: Get all facilities with pagination and filtering
 *     tags: [Facility Details]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of facilities per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in site name, city, location, or client name
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: facilityType
 *         schema:
 *           type: string
 *           enum: [residential, corporate, industrial, hospitality]
 *         description: Filter by facility type
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [siteName, city, clientName, facilityType, createdAt, updatedAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Facilities retrieved successfully
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
 *                     facilities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FacilityDetails'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalCount:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPreviousPage:
 *                           type: boolean
 *       400:
 *         description: Invalid query parameters
 */
router.get('/', validateFacilityQuery, FacilityDetailsController.getAllFacilities);

/**
 * @swagger
 * /api/facilities:
 *   post:
 *     summary: Create a new facility with auto-initialized services
 *     description: Creates a new facility and automatically initializes default services for all categories (Soft Services, Technical Services, AMC Services)
 *     tags: [Facility Details]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - siteName
 *               - city
 *               - location
 *               - clientName
 *               - position
 *               - contactNo
 *               - facilityType
 *             properties:
 *               siteName:
 *                 type: string
 *                 maxLength: 100
 *               city:
 *                 type: string
 *                 maxLength: 50
 *               location:
 *                 type: string
 *                 maxLength: 200
 *               clientName:
 *                 type: string
 *                 maxLength: 100
 *               position:
 *                 type: string
 *                 maxLength: 100
 *               contactNo:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               facilityType:
 *                 type: string
 *                 enum: [residential, corporate, industrial, hospitality]
 *               createdBy:
 *                 type: string
 *                 format: objectId
 *                 description: Optional user ID who created the facility (used for service initialization audit)
 *           example:
 *             siteName: "Downtown Office Complex"
 *             city: "New York"
 *             location: "123 Main Street, Downtown, NY 10001"
 *             clientName: "John Doe"
 *             position: "Facility Manager"
 *             contactNo: "+1-555-123-4567"
 *             email: "john.doe@example.com"
 *             facilityType: "corporate"
 *             createdBy: "60d5f484f1a2c8b1f8b4567b"
 *     responses:
 *       201:
 *         description: Facility created successfully with services auto-initialized
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
 *                   example: Facility created successfully with services initialized
 *                 data:
 *                   type: object
 *                   properties:
 *                     facility:
 *                       $ref: '#/components/schemas/FacilityDetails'
 *       400:
 *         description: Validation error
 */
router.post('/', validateCreateFacility, FacilityDetailsController.createFacility);

/**
 * @swagger
 * /api/facilities/bulk:
 *   post:
 *     summary: Create multiple facilities at once
 *     tags: [Facility Details]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - facilities
 *             properties:
 *               facilities:
 *                 type: array
 *                 maxItems: 100
 *                 items:
 *                   type: object
 *                   required:
 *                     - siteName
 *                     - city
 *                     - location
 *                     - clientName
 *                     - position
 *                     - contactNo
 *                     - facilityType
 *                   properties:
 *                     siteName:
 *                       type: string
 *                     city:
 *                       type: string
 *                     location:
 *                       type: string
 *                     clientName:
 *                       type: string
 *                     position:
 *                       type: string
 *                     contactNo:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     facilityType:
 *                       type: string
 *                       enum: [residential, corporate, industrial, hospitality]
 *           example:
 *             facilities:
 *               - siteName: "Office Complex A"
 *                 city: "New York"
 *                 location: "123 Main St, NY"
 *                 clientName: "John Doe"
 *                 position: "Manager"
 *                 contactNo: "+1-555-123-4567"
 *                 facilityType: "corporate"
 *               - siteName: "Residential Tower B"
 *                 city: "Chicago"
 *                 location: "456 Oak Ave, IL"
 *                 clientName: "Jane Smith"
 *                 position: "Supervisor"
 *                 contactNo: "+1-555-987-6543"
 *                 facilityType: "residential"
 *     responses:
 *       201:
 *         description: Facilities created successfully
 *       400:
 *         description: Validation error
 */
router.post('/bulk', validateBulkCreateFacilities, FacilityDetailsController.bulkCreateFacilities);

/**
 * @swagger
 * /api/facilities/stats:
 *   get:
 *     summary: Get facilities statistics
 *     tags: [Facility Details]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     totalFacilities:
 *                       type: integer
 *                     facilitiesByType:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     facilitiesByCity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     recentFacilities:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/stats', FacilityDetailsController.getFacilitiesStats);

/**
 * @swagger
 * /api/facilities/{id}:
 *   get:
 *     summary: Get facility by ID
 *     tags: [Facility Details]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *     responses:
 *       200:
 *         description: Facility retrieved successfully
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
 *                     facility:
 *                       $ref: '#/components/schemas/FacilityDetails'
 *       400:
 *         description: Invalid facility ID
 *       404:
 *         description: Facility not found
 */
router.get('/:id', FacilityDetailsController.getFacilityById);

/**
 * @swagger
 * /api/facilities/{id}:
 *   put:
 *     summary: Update facility by ID
 *     tags: [Facility Details]
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               siteName:
 *                 type: string
 *                 maxLength: 100
 *               city:
 *                 type: string
 *                 maxLength: 50
 *               location:
 *                 type: string
 *                 maxLength: 200
 *               clientName:
 *                 type: string
 *                 maxLength: 100
 *               position:
 *                 type: string
 *                 maxLength: 100
 *               contactNo:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               facilityType:
 *                 type: string
 *                 enum: [residential, corporate, industrial, hospitality]
 *     responses:
 *       200:
 *         description: Facility updated successfully
 *       400:
 *         description: Invalid facility ID or validation error
 *       404:
 *         description: Facility not found
 */
router.put('/:id', validateUpdateFacility, FacilityDetailsController.updateFacility);

/**
 * @swagger
 * /api/facilities/{id}:
 *   delete:
 *     summary: Delete facility by ID
 *     tags: [Facility Details]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *     responses:
 *       200:
 *         description: Facility deleted successfully
 *       400:
 *         description: Invalid facility ID
 *       404:
 *         description: Facility not found
 */
router.delete('/:id', FacilityDetailsController.deleteFacility);

/**
 * @swagger
 * /api/facilities/tenant/{tenantId}:
 *   get:
 *     summary: Get facility by tenant ID
 *     tags: [Facility Details]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Facility retrieved successfully
 *       404:
 *         description: Facility not found
 */
router.get('/tenant/:tenantId', FacilityDetailsController.getFacilityByTenantId);

/**
 * @swagger
 * /api/facilities/tenant/{tenantId}:
 *   put:
 *     summary: Update facility by tenant ID
 *     tags: [Facility Details]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               siteName:
 *                 type: string
 *               city:
 *                 type: string
 *               location:
 *                 type: string
 *               clientName:
 *                 type: string
 *               position:
 *                 type: string
 *               contactNo:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               facilityType:
 *                 type: string
 *                 enum: [residential, corporate, industrial, hospitality]
 *     responses:
 *       200:
 *         description: Facility updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Facility not found
 */
router.put('/tenant/:tenantId', validateUpdateFacility, FacilityDetailsController.updateFacilityByTenantId);

/**
 * @swagger
 * /api/facilities/tenant/{tenantId}:
 *   delete:
 *     summary: Delete facility by tenant ID
 *     tags: [Facility Details]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Facility deleted successfully
 *       404:
 *         description: Facility not found
 */
router.delete('/tenant/:tenantId', FacilityDetailsController.deleteFacilityByTenantId);

export default router;
