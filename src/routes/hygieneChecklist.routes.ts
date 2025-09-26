import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { HygieneChecklistController } from '../controllers/hygieneChecklist.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/hygiene-checklists/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept only Excel files
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     HygieneChecklist:
 *       type: object
 *       required:
 *         - facilityId
 *         - sectionId
 *         - checklistType
 *         - fileName
 *         - filePath
 *         - createdBy
 *         - updatedBy
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the hygiene checklist
 *         facilityId:
 *           type: string
 *           description: ID of the facility
 *         sectionId:
 *           type: string
 *           description: ID of the hygiene section
 *         checklistType:
 *           type: string
 *           description: Type of checklist (daily, weekly, monthly)
 *         fileName:
 *           type: string
 *           description: Original file name
 *         filePath:
 *           type: string
 *           description: Storage path of the file
 *         fileSize:
 *           type: number
 *           description: File size in bytes
 *         uploadDate:
 *           type: string
 *           format: date-time
 *           description: Date when file was uploaded
 *         uploadedBy:
 *           type: string
 *           description: ID of user who uploaded the file
 *         isActive:
 *           type: boolean
 *           default: true
 *         createdBy:
 *           type: string
 *           description: ID of user who created the hygiene checklist
 *         updatedBy:
 *           type: string
 *           description: ID of user who last updated the hygiene checklist
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
 * /api/hygiene-checklists:
 *   post:
 *     summary: Upload a new hygiene checklist
 *     tags: [Hygiene Checklists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - sectionId
 *               - checklistType
 *               - file
 *             properties:
 *               facilityId:
 *                 type: string
 *                 description: ID of the facility (optional for facility managers)
 *               sectionId:
 *                 type: string
 *                 description: ID of the hygiene section
 *               checklistType:
 *                 type: string
 *                 description: Type of checklist
 *                 example: "daily"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file to upload
 *     responses:
 *       201:
 *         description: Hygiene checklist uploaded successfully
 *       400:
 *         description: Bad request or invalid file
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, upload.single('file'), HygieneChecklistController.createHygieneChecklist);

/**
 * @swagger
 * /api/hygiene-checklists:
 *   get:
 *     summary: Get all hygiene checklists
 *     tags: [Hygiene Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: facilityId
 *         schema:
 *           type: string
 *         description: Filter by facility ID
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *         description: Filter by hygiene section ID
 *       - in: query
 *         name: checklistType
 *         schema:
 *           type: string
 *         description: Filter by checklist type (daily, weekly, monthly)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Hygiene checklists retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', AuthMiddleware.authenticate, AuthMiddleware.requireManager, HygieneChecklistController.getAllHygieneChecklists);

/**
 * @swagger
 * /api/hygiene-checklists/{id}:
 *   get:
 *     summary: Get hygiene checklist by ID
 *     tags: [Hygiene Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hygiene checklist ID
 *     responses:
 *       200:
 *         description: Hygiene checklist retrieved successfully
 *       400:
 *         description: Invalid hygiene checklist ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Hygiene checklist not found
 */
router.get('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, HygieneChecklistController.getHygieneChecklistById);

/**
 * @swagger
 * /api/hygiene-checklists/{id}/download:
 *   get:
 *     summary: Download hygiene checklist file
 *     tags: [Hygiene Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hygiene checklist ID
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid hygiene checklist ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Hygiene checklist not found
 */
router.get('/:id/download', AuthMiddleware.authenticate, AuthMiddleware.requireManager, HygieneChecklistController.downloadHygieneChecklist);

/**
 * @swagger
 * /api/hygiene-checklists/{id}:
 *   patch:
 *     summary: Update hygiene checklist
 *     tags: [Hygiene Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hygiene checklist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checklistType:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Hygiene checklist updated successfully
 *       400:
 *         description: Invalid hygiene checklist ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Hygiene checklist not found
 */
router.patch('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, HygieneChecklistController.updateHygieneChecklist);

/**
 * @swagger
 * /api/hygiene-checklists/{id}:
 *   delete:
 *     summary: Delete hygiene checklist (soft delete)
 *     tags: [Hygiene Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hygiene checklist ID
 *     responses:
 *       200:
 *         description: Hygiene checklist deleted successfully
 *       400:
 *         description: Invalid hygiene checklist ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Hygiene checklist not found
 */
router.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireManager, HygieneChecklistController.deleteHygieneChecklist);

export default router;