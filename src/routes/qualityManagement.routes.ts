import express from 'express';
import {
  // STP controllers
  createSTP,
  getAllSTP,
  getSTPById,
  updateSTP,
  deleteSTP,
  // WTP controllers
  createWTP,
  getAllWTP,
  getWTPById,
  updateWTP,
  deleteWTP,
  // Swimming Pool controllers
  createSwimmingPool,
  getAllSwimmingPools,
  getSwimmingPoolById,
  updateSwimmingPool,
  deleteSwimmingPool,
  // RO Plant controllers
  createROPlant,
  getAllROPlants,
  getROPlantById,
  updateROPlant,
  deleteROPlant
} from '../controllers/qualityManagement.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import {
  validateCreateSTP,
  validateUpdateSTP,
  validateCreateWTP,
  validateUpdateWTP,
  validateCreateSwimmingPool,
  validateUpdateSwimmingPool,
  validateCreateROPlant,
  validateUpdateROPlant
} from '../validations/qualityManagement.validation';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     STP:
 *       type: object
 *       required:
 *         - mlss
 *         - facilityId
 *       properties:
 *         id:
 *           type: string
 *         mlss:
 *           type: number
 *           description: Mixed Liquor Suspended Solids in mg/L
 *         mlssNormalRangeMin:
 *           type: number
 *           default: 2000
 *         mlssNormalRangeMax:
 *           type: number
 *           default: 4000
 *         backwash:
 *           type: string
 *           enum: [ON, OFF]
 *           default: OFF
 *         backwashWaterFlow:
 *           type: number
 *           description: Backwash water flow in KL
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         facilityId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     WTP:
 *       type: object
 *       required:
 *         - inputHardness
 *         - outputHardness
 *         - tds
 *         - facilityId
 *       properties:
 *         id:
 *           type: string
 *         inputHardness:
 *           type: number
 *           description: Input hardness in ppm
 *         outputHardness:
 *           type: number
 *           description: Output hardness in ppm
 *         regeneration:
 *           type: string
 *           enum: [ON, OFF]
 *           default: OFF
 *         regenWaterFlow:
 *           type: number
 *           description: Regeneration water flow in KL
 *         tds:
 *           type: number
 *           description: Total Dissolved Solids in ppm
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         facilityId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     SwimmingPool:
 *       type: object
 *       required:
 *         - phLevel
 *         - chlorine
 *         - facilityId
 *       properties:
 *         id:
 *           type: string
 *         phLevel:
 *           type: number
 *           minimum: 0
 *           maximum: 14
 *           description: pH level (0-14)
 *         phNormalRangeMin:
 *           type: number
 *           default: 7.2
 *         phNormalRangeMax:
 *           type: number
 *           default: 7.6
 *         chlorine:
 *           type: number
 *           description: Chlorine level in ppm
 *         chlorineNormalRangeMin:
 *           type: number
 *           default: 1.0
 *         chlorineNormalRangeMax:
 *           type: number
 *           default: 3.0
 *         backwash:
 *           type: string
 *           enum: [ON, OFF]
 *           default: OFF
 *         backwashFlow:
 *           type: number
 *           description: Backwash flow in KL
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         facilityId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     ROPlant:
 *       type: object
 *       required:
 *         - inputTDS
 *         - outputTDS
 *         - usagePointHardness
 *         - facilityId
 *       properties:
 *         id:
 *           type: string
 *         inputTDS:
 *           type: number
 *           description: Input TDS in ppm
 *         outputTDS:
 *           type: number
 *           description: Output TDS in ppm
 *         regeneration:
 *           type: string
 *           enum: [ON, OFF]
 *           default: OFF
 *         regenWaterFlow:
 *           type: number
 *           description: Regeneration water flow in KL
 *         usagePointHardness:
 *           type: number
 *           description: Usage point hardness in ppm
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         facilityId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// STP ROUTES
/**
 * @swagger
 * /api/quality-management/stp:
 *   post:
 *     summary: Create a new STP configuration
 *     tags: [Quality Management - STP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mlss
 *               - facilityId
 *             properties:
 *               mlss:
 *                 type: number
 *                 example: 3000
 *                 description: MLSS in mg/L
 *               mlssNormalRangeMin:
 *                 type: number
 *                 example: 2000
 *               mlssNormalRangeMax:
 *                 type: number
 *                 example: 4000
 *               backwash:
 *                 type: string
 *                 enum: [ON, OFF]
 *                 example: OFF
 *               backwashWaterFlow:
 *                 type: number
 *                 example: 100
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *               facilityId:
 *                 type: string
 *                 example: "64f8b3a1c5e2d8f1a2b3c4d5"
 *     responses:
 *       201:
 *         description: STP configuration created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/stp',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateCreateSTP,
  createSTP
);

/**
 * @swagger
 * /api/quality-management/stp:
 *   get:
 *     summary: Get all STP configurations
 *     tags: [Quality Management - STP]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: facilityId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: STP configurations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stp',
  AuthMiddleware.authenticate,
  getAllSTP
);

/**
 * @swagger
 * /api/quality-management/stp/{id}:
 *   get:
 *     summary: Get STP configuration by ID
 *     tags: [Quality Management - STP]
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
 *         description: STP configuration retrieved successfully
 *       404:
 *         description: STP configuration not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stp/:id',
  AuthMiddleware.authenticate,
  getSTPById
);

/**
 * @swagger
 * /api/quality-management/stp/{id}:
 *   put:
 *     summary: Update STP configuration
 *     tags: [Quality Management - STP]
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
 *             $ref: '#/components/schemas/STP'
 *     responses:
 *       200:
 *         description: STP configuration updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: STP configuration not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/stp/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateUpdateSTP,
  updateSTP
);

/**
 * @swagger
 * /api/quality-management/stp/{id}:
 *   delete:
 *     summary: Delete STP configuration
 *     tags: [Quality Management - STP]
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
 *         description: STP configuration deleted successfully
 *       404:
 *         description: STP configuration not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/stp/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  deleteSTP
);

// WTP ROUTES
router.post('/wtp',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateCreateWTP,
  createWTP
);

router.get('/wtp',
  AuthMiddleware.authenticate,
  getAllWTP
);

router.get('/wtp/:id',
  AuthMiddleware.authenticate,
  getWTPById
);

router.put('/wtp/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateUpdateWTP,
  updateWTP
);

router.delete('/wtp/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  deleteWTP
);

// SWIMMING POOL ROUTES
router.post('/swimming-pools',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateCreateSwimmingPool,
  createSwimmingPool
);

router.get('/swimming-pools',
  AuthMiddleware.authenticate,
  getAllSwimmingPools
);

router.get('/swimming-pools/:id',
  AuthMiddleware.authenticate,
  getSwimmingPoolById
);

router.put('/swimming-pools/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateUpdateSwimmingPool,
  updateSwimmingPool
);

router.delete('/swimming-pools/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  deleteSwimmingPool
);

// RO PLANT ROUTES
router.post('/ro-plants',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateCreateROPlant,
  createROPlant
);

router.get('/ro-plants',
  AuthMiddleware.authenticate,
  getAllROPlants
);

router.get('/ro-plants/:id',
  AuthMiddleware.authenticate,
  getROPlantById
);

router.put('/ro-plants/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateUpdateROPlant,
  updateROPlant
);

router.delete('/ro-plants/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  deleteROPlant
);

export default router;