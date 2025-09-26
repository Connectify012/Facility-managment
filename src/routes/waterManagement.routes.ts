import express from 'express';
import {
    // Borewell controllers
    createBorewell,
    // Cauvery controllers
    createCauvery,
    // Tanker controllers
    createTanker,
    // Water Tank controllers
    createWaterTank,
    deleteBorewell,
    deleteCauvery,
    deleteTanker,
    deleteWaterTank,
    getAllBorewells,
    getAllCauvery,
    getAllTankers,
    getAllWaterTanks,
    getBorewellById,
    getCauveryById,
    getTankerById,
    getWaterTankById,
    updateBorewell,
    updateCauvery,
    updateTanker,
    updateWaterTank
} from '../controllers/waterManagement.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import {
    validateCreateBorewell,
    validateCreateCauvery,
    validateCreateTanker,
    validateCreateWaterTank,
    validateUpdateBorewell,
    validateUpdateCauvery,
    validateUpdateTanker,
    validateUpdateWaterTank
} from '../validations/waterManagement.validation';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WaterTank:
 *       type: object
 *       required:
 *         - tankName
 *         - location
 *         - capacity
 *         - type
 *         - facilityId
 *       properties:
 *         id:
 *           type: string
 *         tankName:
 *           type: string
 *         location:
 *           type: string
 *         capacity:
 *           type: number
 *           description: Capacity in KL
 *         type:
 *           type: string
 *           enum: [overhead, underground, surface, storage]
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
 *     Borewell:
 *       type: object
 *       required:
 *         - borewellName
 *         - location
 *         - depth
 *         - waterSupplied
 *         - facilityId
 *       properties:
 *         id:
 *           type: string
 *         borewellName:
 *           type: string
 *         location:
 *           type: string
 *         depth:
 *           type: number
 *           description: Depth in meters
 *         waterSupplied:
 *           type: number
 *           description: Water supplied in KL
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
 *     Cauvery:
 *       type: object
 *       required:
 *         - waterSupplied
 *         - facilityId
 *       properties:
 *         id:
 *           type: string
 *         waterSupplied:
 *           type: number
 *           description: Water supplied in KL
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
 *     Tanker:
 *       type: object
 *       required:
 *         - totalTankers
 *         - tankerCapacity
 *         - facilityId
 *       properties:
 *         id:
 *           type: string
 *         totalTankers:
 *           type: number
 *         tankerCapacity:
 *           type: number
 *           description: Capacity per tanker in KL
 *         totalWaterSupplied:
 *           type: number
 *           description: Total water supplied (calculated)
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

// WATER TANK ROUTES
/**
 * @swagger
 * /api/water-management/tanks:
 *   post:
 *     summary: Create a new water tank
 *     tags: [Water Management - Tanks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WaterTank'
 *     responses:
 *       201:
 *         description: Water tank created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/tanks',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateCreateWaterTank,
  createWaterTank
);

/**
 * @swagger
 * /api/water-management/tanks:
 *   get:
 *     summary: Get all water tanks
 *     tags: [Water Management - Tanks]
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [overhead, underground, surface, storage]
 *     responses:
 *       200:
 *         description: Water tanks retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/tanks',
  AuthMiddleware.authenticate,
  getAllWaterTanks
);

/**
 * @swagger
 * /api/water-management/tanks/{id}:
 *   get:
 *     summary: Get water tank by ID
 *     tags: [Water Management - Tanks]
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
 *         description: Water tank retrieved successfully
 *       404:
 *         description: Water tank not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/tanks/:id',
  AuthMiddleware.authenticate,
  getWaterTankById
);

/**
 * @swagger
 * /api/water-management/tanks/{id}:
 *   put:
 *     summary: Update water tank
 *     tags: [Water Management - Tanks]
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
 *             $ref: '#/components/schemas/WaterTank'
 *     responses:
 *       200:
 *         description: Water tank updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Water tank not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/tanks/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateUpdateWaterTank,
  updateWaterTank
);

/**
 * @swagger
 * /api/water-management/tanks/{id}:
 *   delete:
 *     summary: Delete water tank
 *     tags: [Water Management - Tanks]
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
 *         description: Water tank deleted successfully
 *       404:
 *         description: Water tank not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/tanks/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  deleteWaterTank
);

// BOREWELL ROUTES
/**
 * @swagger
 * /api/water-management/borewells:
 *   post:
 *     summary: Create a new borewell
 *     tags: [Water Management - Borewells]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - borewellName
 *               - location
 *               - depth
 *               - waterSupplied
 *               - facilityId
 *             properties:
 *               borewellName:
 *                 type: string
 *                 example: "BW-001"
 *               location:
 *                 type: string
 *                 example: "North Campus"
 *               depth:
 *                 type: number
 *                 example: 150
 *                 description: Depth in meters
 *               waterSupplied:
 *                 type: number
 *                 example: 500
 *                 description: Water supplied in KL
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *               facilityId:
 *                 type: string
 *                 example: "64f8b3a1c5e2d8f1a2b3c4d5"
 *     responses:
 *       201:
 *         description: Borewell created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/borewells',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateCreateBorewell,
  createBorewell
);

/**
 * @swagger
 * /api/water-management/borewells:
 *   get:
 *     summary: Get all borewells
 *     tags: [Water Management - Borewells]
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
 *         description: Borewells retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/borewells',
  AuthMiddleware.authenticate,
  getAllBorewells
);

/**
 * @swagger
 * /api/water-management/borewells/{id}:
 *   get:
 *     summary: Get borewell by ID
 *     tags: [Water Management - Borewells]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Borewell ID
 *     responses:
 *       200:
 *         description: Borewell retrieved successfully
 *       404:
 *         description: Borewell not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/borewells/:id',
  AuthMiddleware.authenticate,
  getBorewellById
);

/**
 * @swagger
 * /api/water-management/borewells/{id}:
 *   put:
 *     summary: Update borewell
 *     tags: [Water Management - Borewells]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Borewell ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               borewellName:
 *                 type: string
 *                 example: "BW-001-Updated"
 *               location:
 *                 type: string
 *                 example: "South Campus"
 *               depth:
 *                 type: number
 *                 example: 180
 *               waterSupplied:
 *                 type: number
 *                 example: 600
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               facilityId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Borewell updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Borewell not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/borewells/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateUpdateBorewell,
  updateBorewell
);

/**
 * @swagger
 * /api/water-management/borewells/{id}:
 *   delete:
 *     summary: Delete borewell
 *     tags: [Water Management - Borewells]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Borewell ID
 *     responses:
 *       200:
 *         description: Borewell deleted successfully
 *       404:
 *         description: Borewell not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/borewells/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  deleteBorewell
);

// CAUVERY ROUTES
/**
 * @swagger
 * /api/water-management/cauvery:
 *   post:
 *     summary: Create new Cauvery water supply data
 *     tags: [Water Management - Cauvery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - waterSupplied
 *               - facilityId
 *             properties:
 *               waterSupplied:
 *                 type: number
 *                 example: 1000
 *                 description: Water supplied in KL
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *               facilityId:
 *                 type: string
 *                 example: "64f8b3a1c5e2d8f1a2b3c4d5"
 *     responses:
 *       201:
 *         description: Cauvery data created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/cauvery',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateCreateCauvery,
  createCauvery
);

/**
 * @swagger
 * /api/water-management/cauvery:
 *   get:
 *     summary: Get all Cauvery water supply data
 *     tags: [Water Management - Cauvery]
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
 *         description: Cauvery data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/cauvery',
  AuthMiddleware.authenticate,
  getAllCauvery
);

/**
 * @swagger
 * /api/water-management/cauvery/{id}:
 *   get:
 *     summary: Get Cauvery data by ID
 *     tags: [Water Management - Cauvery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cauvery data ID
 *     responses:
 *       200:
 *         description: Cauvery data retrieved successfully
 *       404:
 *         description: Cauvery data not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/cauvery/:id',
  AuthMiddleware.authenticate,
  getCauveryById
);

/**
 * @swagger
 * /api/water-management/cauvery/{id}:
 *   put:
 *     summary: Update Cauvery water supply data
 *     tags: [Water Management - Cauvery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cauvery data ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               waterSupplied:
 *                 type: number
 *                 example: 1200
 *                 description: Water supplied in KL
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               facilityId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cauvery data updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Cauvery data not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/cauvery/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateUpdateCauvery,
  updateCauvery
);

/**
 * @swagger
 * /api/water-management/cauvery/{id}:
 *   delete:
 *     summary: Delete Cauvery water supply data
 *     tags: [Water Management - Cauvery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cauvery data ID
 *     responses:
 *       200:
 *         description: Cauvery data deleted successfully
 *       404:
 *         description: Cauvery data not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/cauvery/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  deleteCauvery
);

// TANKER ROUTES
router.post('/tankers',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateCreateTanker,
  createTanker
);

router.get('/tankers',
  AuthMiddleware.authenticate,
  getAllTankers
);

router.get('/tankers/:id',
  AuthMiddleware.authenticate,
  getTankerById
);

router.put('/tankers/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  validateUpdateTanker,
  updateTanker
);

router.delete('/tankers/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireManager,
  deleteTanker
);

export default router;