import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { HygieneChecklist } from '../models/HygieneChecklist';
import { HygieneSection } from '../models/HygieneSection';
import { UserRole } from '../models/User';
import { validateObjectId } from '../utils/validation';

export class HygieneChecklistController {
  // Create Hygiene Checklist (File Upload)
  static async createHygieneChecklist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const file = req.file;

      if (!file) {
        return next(new AppError('Please upload a file', 400));
      }

      // Get facilityId from user's managed facilities
      let facilityId: string;
      
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        // Super admin and admin can create hygiene checklist for any facility
        facilityId = req.body.facilityId;
        if (!facilityId) {
          return next(new AppError('facilityId is required', 400));
        }
      } else if (user.role === UserRole.FACILITY_MANAGER) {
        // Facility manager can only create for their managed facilities
        if (req.body.facilityId) {
          const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
          if (!managedFacilityIds.includes(req.body.facilityId)) {
            return next(new AppError('You can only create hygiene checklists for your managed facilities', 403));
          }
          facilityId = req.body.facilityId;
        } else {
          // Use first managed facility if not specified
          if (user.managedFacilities.length === 0) {
            return next(new AppError('No managed facilities found', 400));
          }
          facilityId = user.managedFacilities[0]._id.toString();
        }
      } else {
        return next(new AppError('Insufficient permissions', 403));
      }

      // Validate sectionId exists
      const sectionExists = await HygieneSection.findOne({ 
        _id: req.body.sectionId, 
        facilityId, 
        isDeleted: false 
      });
      if (!sectionExists) {
        return next(new AppError('Invalid section ID or section does not belong to this facility', 400));
      }

      const hygieneChecklistData = {
        facilityId,
        sectionId: req.body.sectionId,
        checklistType: req.body.checklistType,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        uploadedBy: user._id,
        createdBy: user._id,
        updatedBy: user._id
      };

      const hygieneChecklist = await HygieneChecklist.create(hygieneChecklistData);
      res.status(201).json({ status: 'success', data: { hygieneChecklist } });
    } catch (err) {
      next(err);
    }
  }

  // Get all Hygiene Checklists (with optional filters)
  static async getAllHygieneChecklists(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { facilityId, sectionId, checklistType, isActive } = req.query;
      const filter: any = { isDeleted: false };

      // Apply facility-based filtering based on user role
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        // Super admin and admin can see all hygiene checklists
        if (facilityId) filter.facilityId = facilityId;
      } else if (user.role === UserRole.FACILITY_MANAGER) {
        // Facility manager can only see hygiene checklists for their managed facilities
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (facilityId) {
          if (!managedFacilityIds.includes(facilityId as string)) {
            return next(new AppError('You can only view hygiene checklists for your managed facilities', 403));
          }
          filter.facilityId = facilityId;
        } else {
          filter.facilityId = { $in: managedFacilityIds };
        }
      }

      if (sectionId) filter.sectionId = sectionId;
      if (checklistType) filter.checklistType = checklistType;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      
      const hygieneChecklists = await HygieneChecklist.find(filter)
        .populate('facilityId', 'siteName city')
        .populate('sectionId', 'sectionName description')
        .populate('uploadedBy', 'firstName lastName')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .sort({ uploadDate: -1 });
        
      res.json({ status: 'success', data: { hygieneChecklists } });
    } catch (err) {
      next(err);
    }
  }

  // Get Hygiene Checklist by ID
  static async getHygieneChecklistById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid hygiene checklist ID', 400));
      
      const hygieneChecklist = await HygieneChecklist.findOne({ _id: id, isDeleted: false })
        .populate('facilityId', 'siteName city')
        .populate('sectionId', 'sectionName description')
        .populate('uploadedBy', 'firstName lastName')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');
        
      if (!hygieneChecklist) return next(new AppError('Hygiene checklist not found', 404));

      // Check if user has access to this hygiene checklist's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(hygieneChecklist.facilityId.toString())) {
          return next(new AppError('You can only view hygiene checklists for your managed facilities', 403));
        }
      }

      res.json({ status: 'success', data: { hygieneChecklist } });
    } catch (err) {
      next(err);
    }
  }

  // Update Hygiene Checklist
  static async updateHygieneChecklist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid hygiene checklist ID', 400));
      
      // First check if hygiene checklist exists and user has access
      const existingHygieneChecklist = await HygieneChecklist.findOne({ _id: id, isDeleted: false });
      if (!existingHygieneChecklist) return next(new AppError('Hygiene checklist not found', 404));

      // Check if user has access to this hygiene checklist's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(existingHygieneChecklist.facilityId.toString())) {
          return next(new AppError('You can only update hygiene checklists for your managed facilities', 403));
        }
      }

      const updateData = {
        ...req.body,
        updatedBy: user._id
      };

      const hygieneChecklist = await HygieneChecklist.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true }
      )
        .populate('facilityId', 'siteName city')
        .populate('sectionId', 'sectionName description')
        .populate('uploadedBy', 'firstName lastName')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');

      res.json({ status: 'success', data: { hygieneChecklist } });
    } catch (err) {
      next(err);
    }
  }

  // Delete Hygiene Checklist (soft delete)
  static async deleteHygieneChecklist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid hygiene checklist ID', 400));
      
      // First check if hygiene checklist exists and user has access
      const existingHygieneChecklist = await HygieneChecklist.findOne({ _id: id, isDeleted: false });
      if (!existingHygieneChecklist) return next(new AppError('Hygiene checklist not found', 404));

      // Check if user has access to this hygiene checklist's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(existingHygieneChecklist.facilityId.toString())) {
          return next(new AppError('You can only delete hygiene checklists for your managed facilities', 403));
        }
      }

      const hygieneChecklist = await HygieneChecklist.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );

      res.json({ status: 'success', message: 'Hygiene checklist deleted', data: { hygieneChecklist } });
    } catch (err) {
      next(err);
    }
  }

  // Download Hygiene Checklist File
  static async downloadHygieneChecklist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid hygiene checklist ID', 400));
      
      const hygieneChecklist = await HygieneChecklist.findOne({ _id: id, isDeleted: false });
      if (!hygieneChecklist) return next(new AppError('Hygiene checklist not found', 404));

      // Check if user has access to this hygiene checklist's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(hygieneChecklist.facilityId.toString())) {
          return next(new AppError('You can only download hygiene checklists for your managed facilities', 403));
        }
      }

      // Set appropriate headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${hygieneChecklist.fileName}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      // Send file path for download (you might need to adjust this based on your file storage setup)
      res.download(hygieneChecklist.filePath, hygieneChecklist.fileName);
    } catch (err) {
      next(err);
    }
  }
}