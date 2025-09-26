import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { ShiftSchedule } from '../models/ShiftSchedule';
import { UserRole } from '../models/User';
import { validateObjectId } from '../utils/validation';

export class ShiftScheduleController {
  // Create Shift Schedule
  static async createShift(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      
      // Get facilityId from user's managed facilities
      let facilityId: string;
      
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        // Super admin and admin can create shift for any facility
        facilityId = req.body.facilityId;
        if (!facilityId) {
          return next(new AppError('facilityId is required', 400));
        }
      } else if (user.role === UserRole.FACILITY_MANAGER) {
        // Facility manager can only create for their managed facilities
        if (req.body.facilityId) {
          const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
          if (!managedFacilityIds.includes(req.body.facilityId)) {
            return next(new AppError('You can only create shift schedules for your managed facilities', 403));
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

      const shiftData = {
        ...req.body,
        facilityId,
        createdBy: user._id,
        updatedBy: user._id
      };

      const shift = await ShiftSchedule.create(shiftData);
      res.status(201).json({ status: 'success', data: { shift } });
    } catch (err) {
      next(err);
    }
  }

  // Get all Shift Schedules (with optional filters)
  static async getAllShifts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { facilityId, employeeId, rosterDate } = req.query;
      const filter: any = { isDeleted: false };

      // Apply facility-based filtering based on user role
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        // Super admin and admin can see all shift schedules
        if (facilityId) filter.facilityId = facilityId;
      } else if (user.role === UserRole.FACILITY_MANAGER) {
        // Facility manager can only see shift schedules for their managed facilities
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (facilityId) {
          if (!managedFacilityIds.includes(facilityId as string)) {
            return next(new AppError('You can only view shift schedules for your managed facilities', 403));
          }
          filter.facilityId = facilityId;
        } else {
          filter.facilityId = { $in: managedFacilityIds };
        }
      }

      if (employeeId) filter.employeeId = employeeId;
      if (rosterDate) filter.rosterDate = rosterDate;
      
      const shifts = await ShiftSchedule.find(filter)
        .populate('facilityId', 'siteName city')
        .populate('employeeId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');
        
      res.json({ status: 'success', data: { shifts } });
    } catch (err) {
      next(err);
    }
  }

  // Get Shift Schedule by ID
  static async getShiftById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid shift ID', 400));
      
      const shift = await ShiftSchedule.findOne({ _id: id, isDeleted: false })
        .populate('facilityId', 'siteName city')
        .populate('employeeId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');
        
      if (!shift) return next(new AppError('Shift not found', 404));

      // Check if user has access to this shift's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(shift.facilityId.toString())) {
          return next(new AppError('You can only view shift schedules for your managed facilities', 403));
        }
      }

      res.json({ status: 'success', data: { shift } });
    } catch (err) {
      next(err);
    }
  }

  // Update Shift Schedule
  static async updateShift(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid shift ID', 400));
      
      // First check if shift exists and user has access
      const existingShift = await ShiftSchedule.findOne({ _id: id, isDeleted: false });
      if (!existingShift) return next(new AppError('Shift not found', 404));

      // Check if user has access to this shift's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(existingShift.facilityId.toString())) {
          return next(new AppError('You can only update shift schedules for your managed facilities', 403));
        }
      }

      const updateData = {
        ...req.body,
        updatedBy: user._id
      };

      const shift = await ShiftSchedule.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true }
      )
        .populate('facilityId', 'siteName city')
        .populate('employeeId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');

      res.json({ status: 'success', data: { shift } });
    } catch (err) {
      next(err);
    }
  }

  // Delete Shift Schedule (soft delete)
  static async deleteShift(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid shift ID', 400));
      
      // First check if shift exists and user has access
      const existingShift = await ShiftSchedule.findOne({ _id: id, isDeleted: false });
      if (!existingShift) return next(new AppError('Shift not found', 404));

      // Check if user has access to this shift's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(existingShift.facilityId.toString())) {
          return next(new AppError('You can only delete shift schedules for your managed facilities', 403));
        }
      }

      const shift = await ShiftSchedule.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );

      res.json({ status: 'success', message: 'Shift deleted', data: { shift } });
    } catch (err) {
      next(err);
    }
  }
}
