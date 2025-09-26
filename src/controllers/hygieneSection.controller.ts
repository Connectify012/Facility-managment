import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { HygieneSection } from '../models/HygieneSection';
import { UserRole } from '../models/User';
import { validateObjectId } from '../utils/validation';

export class HygieneSectionController {
  // Create Hygiene Section
  static async createHygieneSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      
      // Get facilityId from user's managed facilities
      let facilityId: string;
      
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        // Super admin and admin can create hygiene section for any facility
        facilityId = req.body.facilityId;
        if (!facilityId) {
          return next(new AppError('facilityId is required', 400));
        }
      } else if (user.role === UserRole.FACILITY_MANAGER) {
        // Facility manager can only create for their managed facilities
        if (req.body.facilityId) {
          const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
          if (!managedFacilityIds.includes(req.body.facilityId)) {
            return next(new AppError('You can only create hygiene sections for your managed facilities', 403));
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

      const hygieneSectionData = {
        ...req.body,
        facilityId,
        createdBy: user._id,
        updatedBy: user._id
      };

      const hygieneSection = await HygieneSection.create(hygieneSectionData);
      res.status(201).json({ status: 'success', data: { hygieneSection } });
    } catch (err) {
      next(err);
    }
  }

  // Get all Hygiene Sections (with optional filters)
  static async getAllHygieneSections(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { facilityId, sectionName, isActive } = req.query;
      const filter: any = { isDeleted: false };

      // Apply facility-based filtering based on user role
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        // Super admin and admin can see all hygiene sections
        if (facilityId) filter.facilityId = facilityId;
      } else if (user.role === UserRole.FACILITY_MANAGER) {
        // Facility manager can only see hygiene sections for their managed facilities
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (facilityId) {
          if (!managedFacilityIds.includes(facilityId as string)) {
            return next(new AppError('You can only view hygiene sections for your managed facilities', 403));
          }
          filter.facilityId = facilityId;
        } else {
          filter.facilityId = { $in: managedFacilityIds };
        }
      }

      if (sectionName) filter.sectionName = { $regex: sectionName, $options: 'i' };
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      
      const hygieneSections = await HygieneSection.find(filter)
        .populate('facilityId', 'siteName city')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .sort({ createdAt: -1 });
        
      res.json({ status: 'success', data: { hygieneSections } });
    } catch (err) {
      next(err);
    }
  }

  // Get Hygiene Section by ID
  static async getHygieneSectionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid hygiene section ID', 400));
      
      const hygieneSection = await HygieneSection.findOne({ _id: id, isDeleted: false })
        .populate('facilityId', 'siteName city')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');
        
      if (!hygieneSection) return next(new AppError('Hygiene section not found', 404));

      // Check if user has access to this hygiene section's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(hygieneSection.facilityId.toString())) {
          return next(new AppError('You can only view hygiene sections for your managed facilities', 403));
        }
      }

      res.json({ status: 'success', data: { hygieneSection } });
    } catch (err) {
      next(err);
    }
  }

  // Update Hygiene Section
  static async updateHygieneSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid hygiene section ID', 400));
      
      // First check if hygiene section exists and user has access
      const existingHygieneSection = await HygieneSection.findOne({ _id: id, isDeleted: false });
      if (!existingHygieneSection) return next(new AppError('Hygiene section not found', 404));

      // Check if user has access to this hygiene section's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(existingHygieneSection.facilityId.toString())) {
          return next(new AppError('You can only update hygiene sections for your managed facilities', 403));
        }
      }

      const updateData = {
        ...req.body,
        updatedBy: user._id
      };

      const hygieneSection = await HygieneSection.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true }
      )
        .populate('facilityId', 'siteName city')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');

      res.json({ status: 'success', data: { hygieneSection } });
    } catch (err) {
      next(err);
    }
  }

  // Delete Hygiene Section (soft delete)
  static async deleteHygieneSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid hygiene section ID', 400));
      
      // First check if hygiene section exists and user has access
      const existingHygieneSection = await HygieneSection.findOne({ _id: id, isDeleted: false });
      if (!existingHygieneSection) return next(new AppError('Hygiene section not found', 404));

      // Check if user has access to this hygiene section's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(existingHygieneSection.facilityId.toString())) {
          return next(new AppError('You can only delete hygiene sections for your managed facilities', 403));
        }
      }

      const hygieneSection = await HygieneSection.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );

      res.json({ status: 'success', message: 'Hygiene section deleted', data: { hygieneSection } });
    } catch (err) {
      next(err);
    }
  }
}