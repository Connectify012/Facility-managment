import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { Roster } from '../models/Roster';
import { UserRole } from '../models/User';
import { validateObjectId } from '../utils/validation';

export class RosterController {
  // Create Roster
  static async createRoster(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      
      // Get facilityId from user's managed facilities
      let facilityId: string;
      
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        // Super admin and admin can create roster for any facility
        facilityId = req.body.facilityId;
        if (!facilityId) {
          return next(new AppError('facilityId is required', 400));
        }
      } else if (user.role === UserRole.FACILITY_MANAGER) {
        // Facility manager can only create for their managed facilities
        if (req.body.facilityId) {
          const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
          if (!managedFacilityIds.includes(req.body.facilityId)) {
            return next(new AppError('You can only create rosters for your managed facilities', 403));
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

      const rosterData = {
        ...req.body,
        facilityId,
        createdBy: user._id,
        updatedBy: user._id
      };

      const roster = await Roster.create(rosterData);
      res.status(201).json({ status: 'success', data: { roster } });
    } catch (err) {
      next(err);
    }
  }

  // Get all Rosters (with optional filters)
  static async getAllRosters(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { facilityId, date } = req.query;
      const filter: any = { isDeleted: false };

      // Apply facility-based filtering based on user role
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        // Super admin and admin can see all rosters
        if (facilityId) filter.facilityId = facilityId;
      } else if (user.role === UserRole.FACILITY_MANAGER) {
        // Facility manager can only see rosters for their managed facilities
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (facilityId) {
          if (!managedFacilityIds.includes(facilityId as string)) {
            return next(new AppError('You can only view rosters for your managed facilities', 403));
          }
          filter.facilityId = facilityId;
        } else {
          filter.facilityId = { $in: managedFacilityIds };
        }
      }

      if (date) filter.date = date;
      
      const rosters = await Roster.find(filter)
        .populate('facilityId', 'siteName city')
        .populate('shifts.employeeId', 'firstName lastName email')
        .populate('shifts.shiftScheduleId', 'shiftName startTime endTime');
        
      res.json({ status: 'success', data: { rosters } });
    } catch (err) {
      next(err);
    }
  }

  // Get Roster by ID
  static async getRosterById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid roster ID', 400));
      
      const roster = await Roster.findOne({ _id: id, isDeleted: false })
        .populate('facilityId', 'siteName city')
        .populate('shifts.employeeId', 'firstName lastName email')
        .populate('shifts.shiftScheduleId', 'shiftName startTime endTime');
        
      if (!roster) return next(new AppError('Roster not found', 404));

      // Check if user has access to this roster's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(roster.facilityId.toString())) {
          return next(new AppError('You can only view rosters for your managed facilities', 403));
        }
      }

      res.json({ status: 'success', data: { roster } });
    } catch (err) {
      next(err);
    }
  }

  // Update Roster
  static async updateRoster(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid roster ID', 400));
      
      // First check if roster exists and user has access
      const existingRoster = await Roster.findOne({ _id: id, isDeleted: false });
      if (!existingRoster) return next(new AppError('Roster not found', 404));

      // Check if user has access to this roster's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(existingRoster.facilityId.toString())) {
          return next(new AppError('You can only update rosters for your managed facilities', 403));
        }
      }

      const updateData = {
        ...req.body,
        updatedBy: user._id
      };

      const roster = await Roster.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true }
      )
        .populate('facilityId', 'siteName city')
        .populate('shifts.employeeId', 'firstName lastName email')
        .populate('shifts.shiftScheduleId', 'shiftName startTime endTime');

      res.json({ status: 'success', data: { roster } });
    } catch (err) {
      next(err);
    }
  }

  // Delete Roster (soft delete)
  static async deleteRoster(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid roster ID', 400));
      
      // First check if roster exists and user has access
      const existingRoster = await Roster.findOne({ _id: id, isDeleted: false });
      if (!existingRoster) return next(new AppError('Roster not found', 404));

      // Check if user has access to this roster's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(existingRoster.facilityId.toString())) {
          return next(new AppError('You can only delete rosters for your managed facilities', 403));
        }
      }

      const roster = await Roster.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );

      res.json({ status: 'success', message: 'Roster deleted', data: { roster } });
    } catch (err) {
      next(err);
    }
  }
}
