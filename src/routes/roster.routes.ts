import { Router } from 'express';
import { RosterController } from '../controllers/roster.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Roster:
 *       type: object
 *       required:
 *         - facilityId
 *         - date
 *         - createdBy
 *         - updatedBy
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the roster
 *         facilityId:
 *           type: string
 *           description: ID of the facility
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the roster
 *         shifts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               shiftScheduleId:
 *                 type: string
 *                 description: Reference to shift schedule
 *               employeeId:
 *                 type: string
 *                 description: Reference to employee
 *               status:
 *                 type: string
 *                 enum: [present, absent, leave, sick]
 *                 description: Employee status for the shift
 *               remarks:
 *                 type: string
 *                 description: Optional remarks
 *         createdBy:
 *           type: string
 *           description: ID of user who created the roster
 *         updatedBy:
 *           type: string
 *           description: ID of user who last updated the roster
 *         isDeleted:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/rosters:
 *   post:
 *     summary: Create a new roster
 *     tags: [Rosters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - facilityId
 *               - date
 *               - createdBy
 *               - updatedBy
 *             properties:
 *               facilityId:
 *                 type: string
 *                 description: ID of the facility
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the roster
 *               shifts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     shiftScheduleId:
 *                       type: string
 *                     employeeId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [present, absent, leave, sick]
 *                     remarks:
 *                       type: string
 *               createdBy:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Roster created successfully
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
 *                     roster:
 *                       $ref: '#/components/schemas/Roster'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, RosterController.createRoster);

/**
 * @swagger
 * /api/rosters:
 *   get:
 *     summary: Get all rosters
 *     tags: [Rosters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: facilityId
 *         schema:
 *           type: string
 *         description: Filter by facility ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date
 *     responses:
 *       200:
 *         description: Rosters retrieved successfully
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
 *                     rosters:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Roster'
 *       401:
 *         description: Unauthorized
 */
router.get('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, RosterController.getAllRosters);

/**
 * @swagger
 * /api/rosters/{id}:
 *   get:
 *     summary: Get roster by ID
 *     tags: [Rosters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Roster ID
 *     responses:
 *       200:
 *         description: Roster retrieved successfully
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
 *                     roster:
 *                       $ref: '#/components/schemas/Roster'
 *       400:
 *         description: Invalid roster ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Roster not found
 */
router.get('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, RosterController.getRosterById);

/**
 * @swagger
 * /api/rosters/{id}:
 *   patch:
 *     summary: Update roster
 *     tags: [Rosters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Roster ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               shifts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     shiftScheduleId:
 *                       type: string
 *                     employeeId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [present, absent, leave, sick]
 *                     remarks:
 *                       type: string
 *               updatedBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Roster updated successfully
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
 *                     roster:
 *                       $ref: '#/components/schemas/Roster'
 *       400:
 *         description: Invalid roster ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Roster not found
 */
router.patch('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, RosterController.updateRoster);

/**
 * @swagger
 * /api/rosters/{id}:
 *   delete:
 *     summary: Delete roster (soft delete)
 *     tags: [Rosters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Roster ID
 *     responses:
 *       200:
 *         description: Roster deleted successfully
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
 *                   example: Roster deleted
 *                 data:
 *                   type: object
 *                   properties:
 *                     roster:
 *                       $ref: '#/components/schemas/Roster'
 *       400:
 *         description: Invalid roster ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Roster not found
 */
router.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, RosterController.deleteRoster);

export default router;
