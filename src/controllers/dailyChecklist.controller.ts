import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { DailyChecklist } from '../models/DailyChecklist';
import { FloorLocation } from '../models/FloorLocation';
import { HygieneSection } from '../models/HygieneSection';

/**
 * @desc Create daily checklist for a floor location
 * @route POST /api/daily-checklists
 * @access Private (FACILITY_MANAGER, ADMIN, SUPER_ADMIN)
 */
export const createDailyChecklist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hygieneSectionId, floorLocationId, checklistDate, checklistItems, assignedDepartment } = req.body;
    const { facilityId } = req.user!;

    // Verify floor location belongs to facility
    const floorLocation = await FloorLocation.findOne({
      _id: floorLocationId,
      facilityId,
      isDeleted: false
    });

    if (!floorLocation) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid floor location'
      });
      return;
    }

    // Verify hygiene section belongs to facility
    const hygieneSection = await HygieneSection.findOne({
      _id: hygieneSectionId,
      facilityId,
      isDeleted: false
    });

    if (!hygieneSection) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid hygiene section'
      });
      return;
    }

    // Check if checklist already exists for this date and location
    const existingChecklist = await DailyChecklist.findOne({
      facilityId,
      hygieneSectionId,
      floorLocationId,
      checklistDate: new Date(checklistDate),
      isDeleted: false
    });

    if (existingChecklist) {
      res.status(400).json({
        status: 'error',
        message: 'Daily checklist already exists for this date and location'
      });
      return;
    }

    const dailyChecklist = new DailyChecklist({
      facilityId,
      hygieneSectionId,
      floorLocationId,
      checklistDate: new Date(checklistDate),
      checklistItems: checklistItems.map((item: any) => ({
        itemName: item.itemName,
        description: item.description,
        isCompleted: false
      })),
      assignedDepartment,
      createdBy: req.user!.userId,
      updatedBy: req.user!.userId
    });

    await dailyChecklist.save();
    await dailyChecklist.populate([
      { path: 'hygieneSectionId', select: 'sectionName' },
      { path: 'floorLocationId', select: 'floorName floorNumber qrCode' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Daily checklist created successfully',
      data: { dailyChecklist }
    });
  } catch (error: any) {
    console.error('Error creating daily checklist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * @desc Get daily checklists for a facility
 * @route GET /api/daily-checklists
 * @access Private (FACILITY_MANAGER, ADMIN, SUPER_ADMIN)
 */
export const getDailyChecklists = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { facilityId } = req.user!;
    const { 
      page = 1, 
      limit = 10, 
      checklistDate,
      status,
      assignedDepartment,
      floorLocationId,
      hygieneSectionId 
    } = req.query;

    const query: any = { facilityId, isDeleted: false };

    if (checklistDate) {
      const date = new Date(checklistDate as string);
      query.checklistDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    if (status) {
      query.overallStatus = status;
    }

    if (assignedDepartment) {
      query.assignedDepartment = assignedDepartment;
    }

    if (floorLocationId) {
      query.floorLocationId = floorLocationId;
    }

    if (hygieneSectionId) {
      query.hygieneSectionId = hygieneSectionId;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [dailyChecklists, total] = await Promise.all([
      DailyChecklist.find(query)
        .populate('hygieneSectionId', 'sectionName')
        .populate('floorLocationId', 'floorName floorNumber qrCode')
        .populate('completedBy', 'firstName lastName email')
        .populate('verifiedBy', 'firstName lastName email')
        .sort({ checklistDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      DailyChecklist.countDocuments(query)
    ]);

    const pagination = {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalItems: total,
      itemsPerPage: Number(limit)
    };

    res.status(200).json({
      status: 'success',
      message: 'Daily checklists retrieved successfully',
      data: {
        dailyChecklists,
        pagination
      }
    });
  } catch (error: any) {
    console.error('Error fetching daily checklists:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * @desc Get daily checklist by QR code scan
 * @route GET /api/daily-checklists/qr/:qrCode
 * @access Private (All authenticated users - for mobile scanning)
 */
export const getDailyChecklistByQR = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { qrCode } = req.params;
    const { checklistDate } = req.query;

    // Find floor location by QR code
    const floorLocation = await FloorLocation.findOne({
      qrCode,
      isActive: true,
      isDeleted: false
    });

    if (!floorLocation) {
      res.status(404).json({
        status: 'error',
        message: 'Invalid QR code'
      });
      return;
    }

    // Get today's date if not provided
    const searchDate = checklistDate ? new Date(checklistDate as string) : new Date();
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    // Get all checklists for this floor for the specified date
    const dailyChecklists = await DailyChecklist.find({
      floorLocationId: floorLocation._id,
      checklistDate: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      isDeleted: false
    }).populate([
      { path: 'hygieneSectionId', select: 'sectionName' },
      { path: 'floorLocationId', select: 'floorName floorNumber' },
      { path: 'completedBy', select: 'firstName lastName' }
    ]).sort({ assignedDepartment: 1 });

    res.status(200).json({
      status: 'success',
      message: 'Daily checklists retrieved successfully',
      data: {
        floorLocation: {
          _id: floorLocation._id,
          floorName: floorLocation.floorName,
          floorNumber: floorLocation.floorNumber,
          qrCode: floorLocation.qrCode
        },
        dailyChecklists,
        checklistDate: searchDate
      }
    });
  } catch (error: any) {
    console.error('Error fetching daily checklist by QR:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * @desc Complete checklist item (QR scan based completion)
 * @route PATCH /api/daily-checklists/:id/items/:itemIndex/complete
 * @access Private (All authenticated users)
 */
export const completeChecklistItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, itemIndex } = req.params;
    const { notes } = req.body;
    const { userId } = req.user!;

    const dailyChecklist = await DailyChecklist.findOne({
      _id: id,
      isDeleted: false
    });

    if (!dailyChecklist) {
      res.status(404).json({
        status: 'error',
        message: 'Daily checklist not found'
      });
      return;
    }

    const itemIdx = parseInt(itemIndex);
    if (itemIdx < 0 || itemIdx >= dailyChecklist.checklistItems.length) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid item index'
      });
      return;
    }

    // Update the specific item
    dailyChecklist.checklistItems[itemIdx].isCompleted = true;
    dailyChecklist.checklistItems[itemIdx].completedAt = new Date();
    dailyChecklist.checklistItems[itemIdx].completedBy = userId;
    if (notes) {
      dailyChecklist.checklistItems[itemIdx].notes = notes;
    }

    // Check if this is the first item being completed
    const wasNotStarted = dailyChecklist.overallStatus === 'PENDING';
    
    // Update overall completion status
    dailyChecklist.updatedBy = userId;
    
    // If all items are completed, mark as completed by this user
    const allCompleted = dailyChecklist.checklistItems.every(item => item.isCompleted);
    if (allCompleted && !dailyChecklist.completedBy) {
      dailyChecklist.completedBy = userId;
    }

    await dailyChecklist.save();
    await dailyChecklist.populate([
      { path: 'hygieneSectionId', select: 'sectionName' },
      { path: 'floorLocationId', select: 'floorName floorNumber' },
      { path: 'completedBy', select: 'firstName lastName' },
      { path: 'checklistItems.completedBy', select: 'firstName lastName' }
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Checklist item completed successfully',
      data: { 
        dailyChecklist,
        completedItem: dailyChecklist.checklistItems[itemIdx],
        wasFirstItem: wasNotStarted,
        allCompleted
      }
    });
  } catch (error: any) {
    console.error('Error completing checklist item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * @desc Verify completed checklist
 * @route PATCH /api/daily-checklists/:id/verify
 * @access Private (FACILITY_MANAGER, ADMIN, SUPER_ADMIN)
 */
export const verifyChecklist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.user!;

    const dailyChecklist = await DailyChecklist.findOne({
      _id: id,
      overallStatus: 'COMPLETED',
      isDeleted: false
    });

    if (!dailyChecklist) {
      res.status(404).json({
        status: 'error',
        message: 'Completed checklist not found'
      });
      return;
    }

    if (dailyChecklist.verifiedBy) {
      res.status(400).json({
        status: 'error',
        message: 'Checklist already verified'
      });
      return;
    }

    dailyChecklist.verifiedBy = userId;
    dailyChecklist.verifiedAt = new Date();
    dailyChecklist.updatedBy = userId;

    await dailyChecklist.save();
    await dailyChecklist.populate([
      { path: 'completedBy', select: 'firstName lastName' },
      { path: 'verifiedBy', select: 'firstName lastName' }
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Checklist verified successfully',
      data: { dailyChecklist }
    });
  } catch (error: any) {
    console.error('Error verifying checklist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * @desc Get checklist statistics for dashboard
 * @route GET /api/daily-checklists/stats
 * @access Private (FACILITY_MANAGER, ADMIN, SUPER_ADMIN)
 */
export const getChecklistStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { facilityId } = req.user!;
    const { startDate, endDate } = req.query;

    const matchQuery: any = { facilityId, isDeleted: false };

    if (startDate && endDate) {
      matchQuery.checklistDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const stats = await DailyChecklist.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$overallStatus',
          count: { $sum: 1 },
          totalItems: { $sum: '$totalItems' },
          completedItems: { $sum: '$completedItems' }
        }
      }
    ]);

    const departmentStats = await DailyChecklist.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$assignedDepartment',
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$overallStatus', 'PENDING'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$overallStatus', 'IN_PROGRESS'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$overallStatus', 'COMPLETED'] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Checklist statistics retrieved successfully',
      data: {
        overallStats: stats,
        departmentStats
      }
    });
  } catch (error: any) {
    console.error('Error fetching checklist stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};