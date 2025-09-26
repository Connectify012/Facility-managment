import { Router } from 'express';
import { LeavePlannerController } from '../controllers/leavePlanner.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LeavePlanner:
 *       type: object
 *       required:
 *         - facilityId
 *         - employeeId
 *         - leaveType
 *         - startDate
 *         - endDate
 *         - createdBy
 *         - updatedBy
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the leave planner
 *         facilityId:
 *           type: string
 *           description: ID of the facility
 *         employeeId:
 *           type: string
 *           description: ID of the employee
 *         leaveType:
 *           type: string
 *           enum: [sick, annual, emergency, maternity, paternity, personal, casual, bereavement]
 *           description: Type of leave
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date of the leave
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date of the leave
 *         totalDays:
 *           type: number
 *           description: Total number of leave days (auto-calculated)
 *         reason:
 *           type: string
 *           description: Reason for the leave
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           default: pending
 *           description: Status of the leave request
 *         appliedDate:
 *           type: string
 *           format: date-time
 *           description: Date when leave was applied
 *         approvedBy:
 *           type: string
 *           description: ID of user who approved the leave
 *         approvedDate:
 *           type: string
 *           format: date-time
 *           description: Date when leave was approved
 *         remarks:
 *           type: string
 *           description: Additional remarks or comments
 *         createdBy:
 *           type: string
 *           description: ID of user who created the leave planner
 *         updatedBy:
 *           type: string
 *           description: ID of user who last updated the leave planner
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
 * /api/leave-planners:
 *   post:
 *     summary: Create a new leave planner
 *     tags: [Leave Planners]
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
 *               - leaveType
 *               - startDate
 *               - endDate
 *             properties:
 *               facilityId:
 *                 type: string
 *                 description: ID of the facility (optional for facility managers)
 *               employeeId:
 *                 type: string
 *                 description: ID of the employee
 *               leaveType:
 *                 type: string
 *                 enum: [sick, annual, emergency, maternity, paternity, personal, casual, bereavement]
 *                 description: Type of leave
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the leave
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the leave
 *               reason:
 *                 type: string
 *                 description: Reason for the leave
 *               remarks:
 *                 type: string
 *                 description: Additional remarks
 *     responses:
 *       201:
 *         description: Leave planner created successfully
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
 *                     leavePlanner:
 *                       $ref: '#/components/schemas/LeavePlanner'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, LeavePlannerController.createLeavePlanner);

/**
 * @swagger
 * /api/leave-planners:
 *   get:
 *     summary: Get all leave planners
 *     tags: [Leave Planners]
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
 *         name: leaveType
 *         schema:
 *           type: string
 *           enum: [sick, annual, emergency, maternity, paternity, personal, casual, bereavement]
 *         description: Filter by leave type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (greater than or equal)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (less than or equal)
 *     responses:
 *       200:
 *         description: Leave planners retrieved successfully
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
 *                     leavePlanners:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LeavePlanner'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, LeavePlannerController.getAllLeavePlanners);

/**
 * @swagger
 * /api/leave-planners/upcoming:
 *   get:
 *     summary: Get upcoming approved leaves
 *     tags: [Leave Planners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: facilityId
 *         schema:
 *           type: string
 *         description: Filter by facility ID
 *     responses:
 *       200:
 *         description: Upcoming leaves retrieved successfully
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
 *                     upcomingLeaves:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LeavePlanner'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/upcoming', AuthMiddleware.authenticate, AuthMiddleware.requireManager, LeavePlannerController.getUpcomingLeaves);

/**
 * @swagger
 * /api/leave-planners/{id}:
 *   get:
 *     summary: Get leave planner by ID
 *     tags: [Leave Planners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave planner ID
 *     responses:
 *       200:
 *         description: Leave planner retrieved successfully
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
 *                     leavePlanner:
 *                       $ref: '#/components/schemas/LeavePlanner'
 *       400:
 *         description: Invalid leave planner ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Leave planner not found
 */
router.get('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, LeavePlannerController.getLeavePlannerById);

/**
 * @swagger
 * /api/leave-planners/{id}:
 *   patch:
 *     summary: Update leave planner
 *     tags: [Leave Planners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave planner ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leaveType:
 *                 type: string
 *                 enum: [sick, annual, emergency, maternity, paternity, personal, casual, bereavement]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Leave planner updated successfully
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
 *                     leavePlanner:
 *                       $ref: '#/components/schemas/LeavePlanner'
 *       400:
 *         description: Invalid leave planner ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Leave planner not found
 */
router.patch('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, LeavePlannerController.updateLeavePlanner);

/**
 * @swagger
 * /api/leave-planners/{id}:
 *   delete:
 *     summary: Delete leave planner (soft delete)
 *     tags: [Leave Planners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave planner ID
 *     responses:
 *       200:
 *         description: Leave planner deleted successfully
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
 *                   example: Leave planner deleted
 *                 data:
 *                   type: object
 *                   properties:
 *                     leavePlanner:
 *                       $ref: '#/components/schemas/LeavePlanner'
 *       400:
 *         description: Invalid leave planner ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Leave planner not found
 */
router.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, LeavePlannerController.deleteLeavePlanner);

export default router;