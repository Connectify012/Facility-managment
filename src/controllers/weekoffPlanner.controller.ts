import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '../models/User';
import { WeekoffPlanner } from '../models/WeekoffPlanner';
import { validateObjectId } from '../utils/validation';

export class WeekoffPlannerController {
  // Create Weekoff Planner
  static async createWeekoffPlanner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      
      // Get facilityId from user's managed facilities
      let facilityId: string;
      
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        // Super admin and admin can create weekoff planner for any facility
        facilityId = req.body.facilityId;
        if (!facilityId) {
          return next(new AppError('facilityId is required', 400));
        }
      } else if (user.role === UserRole.FACILITY_MANAGER) {
        // Facility manager can only create for their managed facilities
        if (req.body.facilityId) {
          const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
          if (!managedFacilityIds.includes(req.body.facilityId)) {
            return next(new AppError('You can only create weekoff planners for your managed facilities', 403));
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

      const weekoffPlannerData = {
        ...req.body,
        facilityId,
        createdBy: user._id,
        updatedBy: user._id
      };

      const weekoffPlanner = await WeekoffPlanner.create(weekoffPlannerData);
      res.status(201).json({ status: 'success', data: { weekoffPlanner } });
    } catch (err) {
      next(err);
    }
  }

  // Get all Weekoff Planners (with optional filters)
  static async getAllWeekoffPlanners(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { facilityId, employeeId, status, weekStartDate } = req.query;
      const filter: any = { isDeleted: false };

      // Apply facility-based filtering based on user role
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        // Super admin and admin can see all weekoff planners
        if (facilityId) filter.facilityId = facilityId;
      } else if (user.role === UserRole.FACILITY_MANAGER) {
        // Facility manager can only see weekoff planners for their managed facilities
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (facilityId) {
          if (!managedFacilityIds.includes(facilityId as string)) {
            return next(new AppError('You can only view weekoff planners for your managed facilities', 403));
          }
          filter.facilityId = facilityId;
        } else {
          filter.facilityId = { $in: managedFacilityIds };
        }
      }

      if (employeeId) filter.employeeId = employeeId;
      if (status) filter.status = status;
      if (weekStartDate) filter.weekStartDate = weekStartDate;
      
      const weekoffPlanners = await WeekoffPlanner.find(filter)
        .populate('facilityId', 'siteName city')
        .populate('employeeId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');
        
      res.json({ status: 'success', data: { weekoffPlanners } });
    } catch (err) {
      next(err);
    }
  }

  // Get Weekoff Planner by ID
  static async getWeekoffPlannerById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid weekoff planner ID', 400));
      
      const weekoffPlanner = await WeekoffPlanner.findOne({ _id: id, isDeleted: false })
        .populate('facilityId', 'siteName city')
        .populate('employeeId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');
        
      if (!weekoffPlanner) return next(new AppError('Weekoff planner not found', 404));

      // Check if user has access to this weekoff planner's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(weekoffPlanner.facilityId.toString())) {
          return next(new AppError('You can only view weekoff planners for your managed facilities', 403));
        }
      }

      res.json({ status: 'success', data: { weekoffPlanner } });
    } catch (err) {
      next(err);
    }
  }

  // Update Weekoff Planner
  static async updateWeekoffPlanner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid weekoff planner ID', 400));
      
      // First check if weekoff planner exists and user has access
      const existingWeekoffPlanner = await WeekoffPlanner.findOne({ _id: id, isDeleted: false });
      if (!existingWeekoffPlanner) return next(new AppError('Weekoff planner not found', 404));

      // Check if user has access to this weekoff planner's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(existingWeekoffPlanner.facilityId.toString())) {
          return next(new AppError('You can only update weekoff planners for your managed facilities', 403));
        }
      }

      const updateData = {
        ...req.body,
        updatedBy: user._id
      };

      const weekoffPlanner = await WeekoffPlanner.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true }
      )
        .populate('facilityId', 'siteName city')
        .populate('employeeId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');

      res.json({ status: 'success', data: { weekoffPlanner } });
    } catch (err) {
      next(err);
    }
  }

  // Delete Weekoff Planner (soft delete)
  static async deleteWeekoffPlanner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      if (!validateObjectId(id)) return next(new AppError('Invalid weekoff planner ID', 400));
      
      // First check if weekoff planner exists and user has access
      const existingWeekoffPlanner = await WeekoffPlanner.findOne({ _id: id, isDeleted: false });
      if (!existingWeekoffPlanner) return next(new AppError('Weekoff planner not found', 404));

      // Check if user has access to this weekoff planner's facility
      if (user.role === UserRole.FACILITY_MANAGER) {
        const managedFacilityIds = user.managedFacilities.map((f: any) => f._id.toString());
        if (!managedFacilityIds.includes(existingWeekoffPlanner.facilityId.toString())) {
          return next(new AppError('You can only delete weekoff planners for your managed facilities', 403));
        }
      }

      const weekoffPlanner = await WeekoffPlanner.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );

      res.json({ status: 'success', message: 'Weekoff planner deleted', data: { weekoffPlanner } });
    } catch (err) {
      next(err);
    }
  }
}