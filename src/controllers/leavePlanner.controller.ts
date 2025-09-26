import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { LeavePlanner } from '../models/LeavePlanner';
import { UserRole } from '../models/User';
import { validateObjectId } from '../utils/validation';

export class LeavePlannerController {
  // Create Leave Planner
  static async createLeavePlanner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      
      // Get facilityId from user's managed facilities
      let facilityId: string;
      
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        // Super admin and admin can create leave planner for any facility
        facilityId = req.body.facilityId;
        if (!facilityId) {
          return next(new AppError('facilityId is required', 400));
        }
      } else if (user.role === UserRole.FACILITY_MANAGER) {
        // Facility manager can only create for their managed facilities
        if (req.body.facilityId) {
          const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
          if (!managedFacilityIds.includes(req.body.facilityId)) {
            return next(new AppError('You can only create leave planners for your managed facilities', 403));
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

      // Calculate total days
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const leavePlannerData = {
        ...req.body,
        facilityId,
        totalDays,
        appliedDate: new Date(),
        createdBy: user._id,
        updatedBy: user._id
      };

      const leavePlanner = await LeavePlanner.create(leavePlannerData);
      res.status(201).json({ status: 'success', data: { leavePlanner } });
    } catch (err) {
      next(err);
    }
  }

  // Get all Leave Planners (with optional filters)
  static async getAllLeavePlanners(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { facilityId, employeeId, status, leaveType, startDate, endDate } = req.query;
      const filter: any = { isDeleted: false };

      // Apply facility-based filtering based on user role
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        // Super admin and admin can see all leave planners
        if (facilityId) filter.facilityId = facilityId;
      } else if (user.role === UserRole.FACILITY_MANAGER) {
        // Facility manager can only see leave planners for their managed facilities
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (facilityId) {
          if (!managedFacilityIds.includes(facilityId as string)) {
            return next(new AppError('You can only view leave planners for your managed facilities', 403));
          }
          filter.facilityId = facilityId;
        } else {
          filter.facilityId = { $in: managedFacilityIds };
        }
      }

      if (employeeId) filter.employeeId = employeeId;
      if (status) filter.status = status;
      if (leaveType) filter.leaveType = leaveType;
      if (startDate) filter.startDate = { $gte: new Date(startDate as string) };
      if (endDate) filter.endDate = { $lte: new Date(endDate as string) };
      
      const leavePlanners = await LeavePlanner.find(filter)
        .populate('facilityId', 'siteName city')
        .populate('employeeId', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .sort({ appliedDate: -1 });
        
      res.json({ status: 'success', data: { leavePlanners } });
    } catch (err) {
      next(err);
    }
  }

  // Get Leave Planner by ID
  static async getLeavePlannerById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid leave planner ID', 400));
      
      const leavePlanner = await LeavePlanner.findOne({ _id: id, isDeleted: false })
        .populate('facilityId', 'siteName city')
        .populate('employeeId', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');
        
      if (!leavePlanner) return next(new AppError('Leave planner not found', 404));

      // Check if user has access to this leave planner's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(leavePlanner.facilityId.toString())) {
          return next(new AppError('You can only view leave planners for your managed facilities', 403));
        }
      }

      res.json({ status: 'success', data: { leavePlanner } });
    } catch (err) {
      next(err);
    }
  }

  // Update Leave Planner
  static async updateLeavePlanner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid leave planner ID', 400));
      
      // First check if leave planner exists and user has access
      const existingLeavePlanner = await LeavePlanner.findOne({ _id: id, isDeleted: false });
      if (!existingLeavePlanner) return next(new AppError('Leave planner not found', 404));

      // Check if user has access to this leave planner's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(existingLeavePlanner.facilityId.toString())) {
          return next(new AppError('You can only update leave planners for your managed facilities', 403));
        }
      }

      const updateData: any = {
        ...req.body,
        updatedBy: user._id
      };

      // If dates are updated, recalculate total days
      if (req.body.startDate || req.body.endDate) {
        const startDate = new Date(req.body.startDate || existingLeavePlanner.startDate);
        const endDate = new Date(req.body.endDate || existingLeavePlanner.endDate);
        updateData.totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }

      // If status is being approved, set approvedBy and approvedDate
      if (req.body.status === 'approved' && existingLeavePlanner.status !== 'approved') {
        updateData.approvedBy = user._id;
        updateData.approvedDate = new Date();
      }

      const leavePlanner = await LeavePlanner.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true }
      )
        .populate('facilityId', 'siteName city')
        .populate('employeeId', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');

      res.json({ status: 'success', data: { leavePlanner } });
    } catch (err) {
      next(err);
    }
  }

  // Delete Leave Planner (soft delete)
  static async deleteLeavePlanner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid leave planner ID', 400));
      
      // First check if leave planner exists and user has access
      const existingLeavePlanner = await LeavePlanner.findOne({ _id: id, isDeleted: false });
      if (!existingLeavePlanner) return next(new AppError('Leave planner not found', 404));

      // Check if user has access to this leave planner's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(existingLeavePlanner.facilityId.toString())) {
          return next(new AppError('You can only delete leave planners for your managed facilities', 403));
        }
      }

      const leavePlanner = await LeavePlanner.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );

      res.json({ status: 'success', message: 'Leave planner deleted', data: { leavePlanner } });
    } catch (err) {
      next(err);
    }
  }

  // Get upcoming leaves for a facility
  static async getUpcomingLeaves(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { facilityId } = req.query;
      const filter: any = { 
        isDeleted: false, 
        status: 'approved',
        startDate: { $gte: new Date() }
      };

      // Apply facility-based filtering based on user role
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        if (facilityId) filter.facilityId = facilityId;
      } else if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (facilityId) {
          if (!managedFacilityIds.includes(facilityId as string)) {
            return next(new AppError('You can only view leaves for your managed facilities', 403));
          }
          filter.facilityId = facilityId;
        } else {
          filter.facilityId = { $in: managedFacilityIds };
        }
      }

      const upcomingLeaves = await LeavePlanner.find(filter)
        .populate('facilityId', 'siteName city')
        .populate('employeeId', 'firstName lastName email')
        .sort({ startDate: 1 })
        .limit(20);

      res.json({ status: 'success', data: { upcomingLeaves } });
    } catch (err) {
      next(err);
    }
  }
}