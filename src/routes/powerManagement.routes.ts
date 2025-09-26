import express from 'express';
import {
    createPowerManagement,
    deletePowerManagement,
    getAllPowerManagement,
    getPowerManagementById,
    updatePowerManagement
} from '../controllers/powerManagement.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import {
    validateCreatePowerManagement,
    validateUpdatePowerManagement
} from '../validations/powerManagement.validation';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PowerManagement:
 *       type: object
 *       required:
 *         - meterId
 *         - location
 *         - connectedLoad
 *         - units
 *         - powerFactor
 *         - facilityId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id
 *         meterId:
 *           type: string
 *           description: Unique meter identifier
 *         location:
 *           type: string
 *           description: Location of the energy meter
 *         connectedLoad:
 *           type: number
 *           description: Connected load in kW
 *         units:
 *           type: number
 *           description: Energy units in kWh
 *         powerFactor:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: Power factor (0-1)
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Status of the meter
 *         facilityId:
 *           type: string
 *           description: Associated facility ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/power-management:
 *   post:
 *     summary: Create a new power management configuration
 *     tags: [Power Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meterId
 *               - location
 *               - connectedLoad
 *               - units
 *               - powerFactor
 *               - facilityId
 *             properties:
 *               meterId:
 *                 type: string
 *               location:
 *                 type: string
 *               connectedLoad:
 *                 type: number
 *               units:
 *                 type: number
 *               powerFactor:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               facilityId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Power management configuration created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', 
  AuthMiddleware.authenticate, 
  AuthMiddleware.requireManager,
  validateCreatePowerManagement, 
  createPowerManagement
);

/**
 * @swagger
 * /api/power-management:
 *   get:
 *     summary: Get all power management configurations
 *     tags: [Power Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: facilityId
 *         schema:
 *           type: string
 *         description: Filter by facility ID
 *     responses:
 *       200:
 *         description: Power management configurations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', 
  AuthMiddleware.authenticate, 
  getAllPowerManagement
);

/**
 * @swagger
 * /api/power-management/{id}:
 *   get:
 *     summary: Get power management configuration by ID
 *     tags: [Power Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Power management configuration ID
 *     responses:
 *       200:
 *         description: Power management configuration retrieved successfully
 *       404:
 *         description: Configuration not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', 
  AuthMiddleware.authenticate, 
  getPowerManagementById
);

/**
 * @swagger
 * /api/power-management/{id}:
 *   put:
 *     summary: Update power management configuration
 *     tags: [Power Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Power management configuration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               meterId:
 *                 type: string
 *               location:
 *                 type: string
 *               connectedLoad:
 *                 type: number
 *               units:
 *                 type: number
 *               powerFactor:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               facilityId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Power management configuration updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Configuration not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:id', 
  AuthMiddleware.authenticate, 
  AuthMiddleware.requireManager,
  validateUpdatePowerManagement, 
  updatePowerManagement
);

/**
 * @swagger
 * /api/power-management/{id}:
 *   delete:
 *     summary: Delete power management configuration
 *     tags: [Power Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Power management configuration ID
 *     responses:
 *       200:
 *         description: Power management configuration deleted successfully
 *       404:
 *         description: Configuration not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', 
  AuthMiddleware.authenticate, 
  AuthMiddleware.requireManager,
  deletePowerManagement
);

export default router;