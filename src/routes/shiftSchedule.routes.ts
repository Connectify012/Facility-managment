import { Router } from 'express';
import { ShiftScheduleController } from '../controllers/shiftSchedule.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ShiftSchedule:
 *       type: object
 *       required:
 *         - facilityId
 *         - employeeId
 *         - shiftName
 *         - startTime
 *         - endTime
 *         - workingDays
 *         - rosterDate
 *         - createdBy
 *         - updatedBy
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the shift schedule
 *         facilityId:
 *           type: string
 *           description: ID of the facility
 *         employeeId:
 *           type: string
 *           description: ID of the employee
 *         shiftName:
 *           type: string
 *           description: Name of the shift (e.g., Morning Shift, Night Shift)
 *         startTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Start time in HH:MM format
 *         endTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: End time in HH:MM format
 *         workingDays:
 *           type: array
 *           items:
 *             type: string
 *             enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *           description: Array of working days
 *         breakDuration:
 *           type: number
 *           default: 60
 *           description: Break duration in minutes
 *         rosterDate:
 *           type: string
 *           format: date
 *           description: Date for the roster
 *         createdBy:
 *           type: string
 *           description: ID of user who created the shift schedule
 *         updatedBy:
 *           type: string
 *           description: ID of user who last updated the shift schedule
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
 * /api/shift-schedules:
 *   post:
 *     summary: Create a new shift schedule
 *     tags: [Shift Schedules]
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
 *               - employeeId
 *               - shiftName
 *               - startTime
 *               - endTime
 *               - workingDays
 *               - rosterDate
 *               - createdBy
 *               - updatedBy
 *             properties:
 *               facilityId:
 *                 type: string
 *                 description: ID of the facility
 *               employeeId:
 *                 type: string
 *                 description: ID of the employee
 *               shiftName:
 *                 type: string
 *                 description: Name of the shift
 *               startTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "17:00"
 *               workingDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                 example: ["monday", "tuesday", "wednesday", "thursday", "friday"]
 *               breakDuration:
 *                 type: number
 *                 default: 60
 *               rosterDate:
 *                 type: string
 *                 format: date
 *               createdBy:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shift schedule created successfully
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
 *                     shift:
 *                       $ref: '#/components/schemas/ShiftSchedule'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, ShiftScheduleController.createShift);

/**
 * @swagger
 * /api/shift-schedules:
 *   get:
 *     summary: Get all shift schedules
 *     tags: [Shift Schedules]
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
 *         name: rosterDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by roster date
 *     responses:
 *       200:
 *         description: Shift schedules retrieved successfully
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
 *                     shifts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ShiftSchedule'
 *       401:
 *         description: Unauthorized
 */
router.get('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, ShiftScheduleController.getAllShifts);

/**
 * @swagger
 * /api/shift-schedules/{id}:
 *   get:
 *     summary: Get shift schedule by ID
 *     tags: [Shift Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shift schedule ID
 *     responses:
 *       200:
 *         description: Shift schedule retrieved successfully
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
 *                     shift:
 *                       $ref: '#/components/schemas/ShiftSchedule'
 *       400:
 *         description: Invalid shift ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shift schedule not found
 */
router.get('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, ShiftScheduleController.getShiftById);

/**
 * @swagger
 * /api/shift-schedules/{id}:
 *   patch:
 *     summary: Update shift schedule
 *     tags: [Shift Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shift schedule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shiftName:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               endTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               workingDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *               breakDuration:
 *                 type: number
 *               rosterDate:
 *                 type: string
 *                 format: date
 *               updatedBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shift schedule updated successfully
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
 *                     shift:
 *                       $ref: '#/components/schemas/ShiftSchedule'
 *       400:
 *         description: Invalid shift ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shift schedule not found
 */
router.patch('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, ShiftScheduleController.updateShift);

/**
 * @swagger
 * /api/shift-schedules/{id}:
 *   delete:
 *     summary: Delete shift schedule (soft delete)
 *     tags: [Shift Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shift schedule ID
 *     responses:
 *       200:
 *         description: Shift schedule deleted successfully
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
 *                   example: Shift deleted
 *                 data:
 *                   type: object
 *                   properties:
 *                     shift:
 *                       $ref: '#/components/schemas/ShiftSchedule'
 *       400:
 *         description: Invalid shift ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shift schedule not found
 */
router.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, ShiftScheduleController.deleteShift);

export default router;
