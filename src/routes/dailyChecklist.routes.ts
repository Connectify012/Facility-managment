import express from 'express';
import {
    completeChecklistItem,
    createDailyChecklist,
    getChecklistStats,
    getDailyChecklistByQR,
    getDailyChecklists,
    verifyChecklist
} from '../controllers/dailyChecklist.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DailyChecklist:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the daily checklist
 *         facilityId:
 *           type: string
 *           description: ID of the facility
 *         hygieneSectionId:
 *           type: string
 *           description: ID of the hygiene section
 *         floorLocationId:
 *           type: string
 *           description: ID of the floor location
 *         checklistDate:
 *           type: string
 *           format: date
 *           description: Date for which this checklist is applicable
 *         checklistItems:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               itemName:
 *                 type: string
 *               description:
 *                 type: string
 *               isCompleted:
 *                 type: boolean
 *               completedAt:
 *                 type: string
 *                 format: date-time
 *               completedBy:
 *                 type: string
 *               notes:
 *                 type: string
 *         overallStatus:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED]
 *         assignedDepartment:
 *           type: string
 *           enum: [HOUSEKEEPING, GARDENING, PEST_CONTROL]
 *         completedBy:
 *           type: string
 *           description: Employee who completed the entire checklist
 *         verifiedBy:
 *           type: string
 *           description: Supervisor who verified the completed work
 *         totalItems:
 *           type: number
 *         completedItems:
 *           type: number
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/daily-checklists:
 *   post:
 *     summary: Create a new daily checklist
 *     tags: [Daily Checklists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hygieneSectionId
 *               - floorLocationId
 *               - checklistDate
 *               - checklistItems
 *               - assignedDepartment
 *             properties:
 *               hygieneSectionId:
 *                 type: string
 *               floorLocationId:
 *                 type: string
 *               checklistDate:
 *                 type: string
 *                 format: date
 *               checklistItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemName:
 *                       type: string
 *                     description:
 *                       type: string
 *               assignedDepartment:
 *                 type: string
 *                 enum: [HOUSEKEEPING, GARDENING, PEST_CONTROL]
 *     responses:
 *       201:
 *         description: Daily checklist created successfully
 *       400:
 *         description: Bad request - Invalid input or checklist already exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, createDailyChecklist);

/**
 * @swagger
 * /api/daily-checklists:
 *   get:
 *     summary: Get all daily checklists for a facility
 *     tags: [Daily Checklists]
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
 *         description: Number of items per page
 *       - in: query
 *         name: checklistDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by checklist date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED]
 *         description: Filter by status
 *       - in: query
 *         name: assignedDepartment
 *         schema:
 *           type: string
 *           enum: [HOUSEKEEPING, GARDENING, PEST_CONTROL]
 *         description: Filter by assigned department
 *       - in: query
 *         name: floorLocationId
 *         schema:
 *           type: string
 *         description: Filter by floor location
 *       - in: query
 *         name: hygieneSectionId
 *         schema:
 *           type: string
 *         description: Filter by hygiene section
 *     responses:
 *       200:
 *         description: Daily checklists retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, getDailyChecklists);

/**
 * @swagger
 * /api/daily-checklists/qr/{qrCode}:
 *   get:
 *     summary: Get daily checklists by QR code scan
 *     tags: [Daily Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: qrCode
 *         required: true
 *         schema:
 *           type: string
 *         description: QR code of the floor location
 *       - in: query
 *         name: checklistDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to get checklists for (defaults to today)
 *     responses:
 *       200:
 *         description: Daily checklists retrieved successfully
 *       404:
 *         description: Invalid QR code
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/qr/:qrCode', AuthMiddleware.authenticate, getDailyChecklistByQR);

/**
 * @swagger
 * /api/daily-checklists/{id}/items/{itemIndex}/complete:
 *   patch:
 *     summary: Complete a specific checklist item
 *     tags: [Daily Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Daily checklist ID
 *       - in: path
 *         name: itemIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index of the item to complete
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Optional notes about the completion
 *     responses:
 *       200:
 *         description: Checklist item completed successfully
 *       404:
 *         description: Daily checklist not found
 *       400:
 *         description: Invalid item index
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/items/:itemIndex/complete', AuthMiddleware.authenticate, completeChecklistItem);

/**
 * @swagger
 * /api/daily-checklists/{id}/verify:
 *   patch:
 *     summary: Verify a completed checklist
 *     tags: [Daily Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Daily checklist ID
 *     responses:
 *       200:
 *         description: Checklist verified successfully
 *       404:
 *         description: Completed checklist not found
 *       400:
 *         description: Checklist already verified
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/verify', AuthMiddleware.authenticate, AuthMiddleware.requireManager, verifyChecklist);

/**
 * @swagger
 * /api/daily-checklists/stats:
 *   get:
 *     summary: Get checklist statistics for dashboard
 *     tags: [Daily Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stats', AuthMiddleware.authenticate, AuthMiddleware.requireManager, getChecklistStats);

export default router;