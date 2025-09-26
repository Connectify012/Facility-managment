import { Router } from 'express';
import { HygieneSectionController } from '../controllers/hygieneSection.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     HygieneSection:
 *       type: object
 *       required:
 *         - facilityId
 *         - sectionName
 *         - createdBy
 *         - updatedBy
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the hygiene section
 *         facilityId:
 *           type: string
 *           description: ID of the facility
 *         sectionName:
 *           type: string
 *           description: Name of the hygiene section (e.g., Housekeeping, Gardening, Pest Control)
 *         description:
 *           type: string
 *           description: Description of the hygiene section
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the section is active
 *         createdBy:
 *           type: string
 *           description: ID of user who created the hygiene section
 *         updatedBy:
 *           type: string
 *           description: ID of user who last updated the hygiene section
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
 * /api/hygiene-sections:
 *   post:
 *     summary: Create a new hygiene section
 *     tags: [Hygiene Sections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sectionName
 *             properties:
 *               facilityId:
 *                 type: string
 *                 description: ID of the facility (optional for facility managers)
 *               sectionName:
 *                 type: string
 *                 description: Name of the hygiene section
 *                 example: "Housekeeping"
 *               description:
 *                 type: string
 *                 description: Description of the hygiene section
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Hygiene section created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, HygieneSectionController.createHygieneSection);

/**
 * @swagger
 * /api/hygiene-sections:
 *   get:
 *     summary: Get all hygiene sections
 *     tags: [Hygiene Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: facilityId
 *         schema:
 *           type: string
 *         description: Filter by facility ID
 *       - in: query
 *         name: sectionName
 *         schema:
 *           type: string
 *         description: Filter by section name (case insensitive)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Hygiene sections retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, HygieneSectionController.getAllHygieneSections);

/**
 * @swagger
 * /api/hygiene-sections/{id}:
 *   get:
 *     summary: Get hygiene section by ID
 *     tags: [Hygiene Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hygiene section ID
 *     responses:
 *       200:
 *         description: Hygiene section retrieved successfully
 *       400:
 *         description: Invalid hygiene section ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Hygiene section not found
 */
router.get('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, HygieneSectionController.getHygieneSectionById);

/**
 * @swagger
 * /api/hygiene-sections/{id}:
 *   patch:
 *     summary: Update hygiene section
 *     tags: [Hygiene Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hygiene section ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sectionName:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Hygiene section updated successfully
 *       400:
 *         description: Invalid hygiene section ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Hygiene section not found
 */
router.patch('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, HygieneSectionController.updateHygieneSection);

/**
 * @swagger
 * /api/hygiene-sections/{id}:
 *   delete:
 *     summary: Delete hygiene section (soft delete)
 *     tags: [Hygiene Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hygiene section ID
 *     responses:
 *       200:
 *         description: Hygiene section deleted successfully
 *       400:
 *         description: Invalid hygiene section ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Hygiene section not found
 */
router.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, HygieneSectionController.deleteHygieneSection);

export default router;