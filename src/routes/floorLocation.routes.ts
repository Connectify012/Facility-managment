import express from 'express';
import {
    createFloorLocation,
    deleteFloorLocation,
    getFloorLocationById,
    getFloorLocationByQR,
    getFloorLocations,
    updateFloorLocation
} from '../controllers/floorLocation.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { validateFloorLocation, validateFloorLocationUpdate } from '../validations/floorLocation.validation';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FloorLocation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the floor location
 *         facilityId:
 *           type: string
 *           description: ID of the facility
 *         floorName:
 *           type: string
 *           description: Name of the floor (e.g., "Floor 1", "Ground Floor")
 *         floorNumber:
 *           type: number
 *           description: Numeric identifier for the floor
 *         qrCode:
 *           type: string
 *           description: Unique QR code for this floor location
 *         description:
 *           type: string
 *           description: Optional description of the floor location
 *         isActive:
 *           type: boolean
 *           description: Whether the floor location is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/floor-locations:
 *   post:
 *     summary: Create a new floor location
 *     tags: [Floor Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - floorName
 *               - floorNumber
 *             properties:
 *               floorName:
 *                 type: string
 *                 example: "Ground Floor"
 *               floorNumber:
 *                 type: number
 *                 example: 0
 *               description:
 *                 type: string
 *                 example: "Main entrance floor"
 *     responses:
 *       201:
 *         description: Floor location created successfully
 *       400:
 *         description: Validation error or floor already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/', 
  AuthMiddleware.authenticate, 
  AuthMiddleware.requireManager,
  validateFloorLocation,
  createFloorLocation
);

/**
 * @swagger
 * /api/floor-locations:
 *   get:
 *     summary: Get all floor locations for a facility
 *     tags: [Floor Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Floor locations retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', 
  AuthMiddleware.authenticate, 
  AuthMiddleware.requireManager,
  getFloorLocations
);

/**
 * @swagger
 * /api/floor-locations/{id}:
 *   get:
 *     summary: Get floor location by ID
 *     tags: [Floor Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Floor location retrieved successfully
 *       404:
 *         description: Floor location not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', 
  AuthMiddleware.authenticate, 
  AuthMiddleware.requireManager,
  getFloorLocationById
);

/**
 * @swagger
 * /api/floor-locations/qr/{qrCode}:
 *   get:
 *     summary: Get floor location by QR code (for mobile scanning)
 *     tags: [Floor Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: qrCode
 *         required: true
 *         schema:
 *           type: string
 *         description: QR code to scan
 *     responses:
 *       200:
 *         description: Floor location retrieved successfully
 *       404:
 *         description: Invalid QR code or floor location not found
 *       401:
 *         description: Unauthorized
 */
router.get('/qr/:qrCode', 
  AuthMiddleware.authenticate,
  getFloorLocationByQR
);

/**
 * @swagger
 * /api/floor-locations/{id}:
 *   put:
 *     summary: Update floor location
 *     tags: [Floor Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               floorName:
 *                 type: string
 *               floorNumber:
 *                 type: number
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Floor location updated successfully
 *       400:
 *         description: Validation error or floor number conflict
 *       404:
 *         description: Floor location not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', 
  AuthMiddleware.authenticate, 
  AuthMiddleware.requireManager,
  validateFloorLocationUpdate,
  updateFloorLocation
);

/**
 * @swagger
 * /api/floor-locations/{id}:
 *   delete:
 *     summary: Delete floor location (soft delete)
 *     tags: [Floor Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Floor location deleted successfully
 *       404:
 *         description: Floor location not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', 
  AuthMiddleware.authenticate, 
  AuthMiddleware.requireManager,
  deleteFloorLocation
);

export default router;