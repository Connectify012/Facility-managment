import { Router } from 'express';
import { WeekoffPlannerController } from '../controllers/weekoffPlanner.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WeekoffPlanner:
 *       type: object
 *       required:
 *         - facilityId
 *         - employeeId
 *         - weekStartDate
 *         - weekEndDate
 *         - weekoffDays
 *         - createdBy
 *         - updatedBy
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the weekoff planner
 *         facilityId:
 *           type: string
 *           description: ID of the facility
 *         employeeId:
 *           type: string
 *           description: ID of the employee
 *         weekStartDate:
 *           type: string
 *           format: date
 *           description: Start date of the week
 *         weekEndDate:
 *           type: string
 *           format: date
 *           description: End date of the week
 *         weekoffDays:
 *           type: array
 *           items:
 *             type: string
 *             enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *           description: Array of weekoff days
 *         reason:
 *           type: string
 *           description: Optional reason for weekoff
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           default: pending
 *           description: Status of the weekoff request
 *         createdBy:
 *           type: string
 *           description: ID of user who created the weekoff planner
 *         updatedBy:
 *           type: string
 *           description: ID of user who last updated the weekoff planner
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
 * /api/weekoff-planners:
 *   post:
 *     summary: Create a new weekoff planner
 *     tags: [Weekoff Planners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - weekStartDate
 *               - weekEndDate
 *               - weekoffDays
 *             properties:
 *               facilityId:
 *                 type: string
 *                 description: ID of the facility (optional for facility managers)
 *               employeeId:
 *                 type: string
 *                 description: ID of the employee
 *               weekStartDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the week
 *               weekEndDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the week
 *               weekoffDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                 example: ["saturday", "sunday"]
 *               reason:
 *                 type: string
 *                 description: Optional reason for weekoff
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 default: pending
 *     responses:
 *       201:
 *         description: Weekoff planner created successfully
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
 *                     weekoffPlanner:
 *                       $ref: '#/components/schemas/WeekoffPlanner'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, WeekoffPlannerController.createWeekoffPlanner);

/**
 * @swagger
 * /api/weekoff-planners:
 *   get:
 *     summary: Get all weekoff planners
 *     tags: [Weekoff Planners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: facilityId
 *         schema:
 *           type: string
 *         description: Filter by facility ID
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: weekStartDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by week start date
 *     responses:
 *       200:
 *         description: Weekoff planners retrieved successfully
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
 *                     weekoffPlanners:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WeekoffPlanner'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, WeekoffPlannerController.getAllWeekoffPlanners);

/**
 * @swagger
 * /api/weekoff-planners/{id}:
 *   get:
 *     summary: Get weekoff planner by ID
 *     tags: [Weekoff Planners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Weekoff planner ID
 *     responses:
 *       200:
 *         description: Weekoff planner retrieved successfully
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
 *                     weekoffPlanner:
 *                       $ref: '#/components/schemas/WeekoffPlanner'
 *       400:
 *         description: Invalid weekoff planner ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Weekoff planner not found
 */
router.get('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, WeekoffPlannerController.getWeekoffPlannerById);

/**
 * @swagger
 * /api/weekoff-planners/{id}:
 *   patch:
 *     summary: Update weekoff planner
 *     tags: [Weekoff Planners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Weekoff planner ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weekStartDate:
 *                 type: string
 *                 format: date
 *               weekEndDate:
 *                 type: string
 *                 format: date
 *               weekoffDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *               reason:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Weekoff planner updated successfully
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
 *                     weekoffPlanner:
 *                       $ref: '#/components/schemas/WeekoffPlanner'
 *       400:
 *         description: Invalid weekoff planner ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Weekoff planner not found
 */
router.patch('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, WeekoffPlannerController.updateWeekoffPlanner);

/**
 * @swagger
 * /api/weekoff-planners/{id}:
 *   delete:
 *     summary: Delete weekoff planner (soft delete)
 *     tags: [Weekoff Planners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Weekoff planner ID
 *     responses:
 *       200:
 *         description: Weekoff planner deleted successfully
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
 *                   example: Weekoff planner deleted
 *                 data:
 *                   type: object
 *                   properties:
 *                     weekoffPlanner:
 *                       $ref: '#/components/schemas/WeekoffPlanner'
 *       400:
 *         description: Invalid weekoff planner ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Weekoff planner not found
 */
router.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, WeekoffPlannerController.deleteWeekoffPlanner);

export default router;