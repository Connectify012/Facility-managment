import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { FloorLocation } from '../models/FloorLocation';

// Helper function to generate consistent API responses
const generateResponse = (success: boolean, message: string, statusCode: number, data?: any) => {
  return { status: success ? 'success' : 'error', message, ...(data && { data }) };
};

/**
 * @desc Create a new floor location with QR code
 * @route POST /api/floor-locations
 * @access Private (FACILITY_MANAGER, ADMIN, SUPER_ADMIN)
 */
export const createFloorLocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { floorName, floorNumber, description } = req.body;
    const { facilityId } = req.user!;

    // Generate unique QR code
    const qrCode = `FL_${facilityId}_${floorNumber}_${uuidv4().substring(0, 8).toUpperCase()}`;

    // Check if floor already exists
    const existingFloor = await FloorLocation.findOne({
      facilityId,
      floorNumber,
      isDeleted: false
    });

    if (existingFloor) {
      res.status(400).json(generateResponse(false, 'Floor location already exists', 400));
      return;
    }

    const floorLocation = new FloorLocation({
      facilityId,
      floorName,
      floorNumber,
      qrCode,
      description,
      createdBy: req.user!.userId,
      updatedBy: req.user!.userId
    });

    await floorLocation.save();
    await floorLocation.populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'updatedBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json(generateResponse(true, 'Floor location created successfully', 201, floorLocation));
  } catch (error: any) {
    console.error('Error creating floor location:', error);
    res.status(500).json(generateResponse(false, 'Internal server error', 500));
  }
};

/**
 * @desc Get all floor locations for a facility
 * @route GET /api/floor-locations
 * @access Private (FACILITY_MANAGER, ADMIN, SUPER_ADMIN)
 */
export const getFloorLocations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { facilityId } = req.user!;
    const { page = 1, limit = 10, search, isActive } = req.query;

    const query: any = { facilityId, isDeleted: false };

    if (search) {
      query.$or = [
        { floorName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [floorLocations, total] = await Promise.all([
      FloorLocation.find(query)
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .sort({ floorNumber: 1 })
        .skip(skip)
        .limit(Number(limit)),
      FloorLocation.countDocuments(query)
    ]);

    const pagination = {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalItems: total,
      itemsPerPage: Number(limit)
    };

    res.status(200).json(generateResponse(true, 'Floor locations retrieved successfully', 200, {
      floorLocations,
      pagination
    }));
  } catch (error: any) {
    console.error('Error fetching floor locations:', error);
    res.status(500).json(generateResponse(false, 'Internal server error', 500));
  }
};

/**
 * @desc Get floor location by ID
 * @route GET /api/floor-locations/:id
 * @access Private (FACILITY_MANAGER, ADMIN, SUPER_ADMIN)
 */
export const getFloorLocationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { facilityId } = req.user!;

    const floorLocation = await FloorLocation.findOne({
      _id: id,
      facilityId,
      isDeleted: false
    }).populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'updatedBy', select: 'firstName lastName email' }
    ]);

    if (!floorLocation) {
      res.status(404).json(generateResponse(false, 'Floor location not found', 404));
      return;
    }

    res.status(200).json(generateResponse(true, 'Floor location retrieved successfully', 200, floorLocation));
  } catch (error: any) {
    console.error('Error fetching floor location:', error);
    res.status(500).json(generateResponse(false, 'Internal server error', 500));
  }
};

/**
 * @desc Get floor location by QR code (for mobile scanning)
 * @route GET /api/floor-locations/qr/:qrCode
 * @access Private (All authenticated users)
 */
export const getFloorLocationByQR = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { qrCode } = req.params;

    const floorLocation = await FloorLocation.findOne({
      qrCode,
      isActive: true,
      isDeleted: false
    }).populate('facilityId', 'facilityName address');

    if (!floorLocation) {
      res.status(404).json(generateResponse(false, 'Invalid QR code or floor location not found', 404));
      return;
    }

    res.status(200).json(generateResponse(true, 'Floor location retrieved successfully', 200, floorLocation));
  } catch (error: any) {
    console.error('Error fetching floor location by QR:', error);
    res.status(500).json(generateResponse(false, 'Internal server error', 500));
  }
};

/**
 * @desc Update floor location
 * @route PUT /api/floor-locations/:id
 * @access Private (FACILITY_MANAGER, ADMIN, SUPER_ADMIN)
 */
export const updateFloorLocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { facilityId } = req.user!;
    const { floorName, floorNumber, description, isActive } = req.body;

    const floorLocation = await FloorLocation.findOne({
      _id: id,
      facilityId,
      isDeleted: false
    });

    if (!floorLocation) {
      res.status(404).json(generateResponse(false, 'Floor location not found', 404));
      return;
    }

    // Check if floor number is being changed and if it conflicts
    if (floorNumber && floorNumber !== floorLocation.floorNumber) {
      const existingFloor = await FloorLocation.findOne({
        facilityId,
        floorNumber,
        _id: { $ne: id },
        isDeleted: false
      });

      if (existingFloor) {
        res.status(400).json(generateResponse(false, 'Floor number already exists', 400));
        return;
      }
    }

    // Update fields
    if (floorName) floorLocation.floorName = floorName;
    if (floorNumber) floorLocation.floorNumber = floorNumber;
    if (description !== undefined) floorLocation.description = description;
    if (isActive !== undefined) floorLocation.isActive = isActive;
    floorLocation.updatedBy = req.user!.userId;

    await floorLocation.save();
    await floorLocation.populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'updatedBy', select: 'firstName lastName email' }
    ]);

    res.status(200).json(generateResponse(true, 'Floor location updated successfully', 200, floorLocation));
  } catch (error: any) {
    console.error('Error updating floor location:', error);
    res.status(500).json(generateResponse(false, 'Internal server error', 500));
  }
};

/**
 * @desc Delete floor location (soft delete)
 * @route DELETE /api/floor-locations/:id
 * @access Private (FACILITY_MANAGER, ADMIN, SUPER_ADMIN)
 */
export const deleteFloorLocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { facilityId } = req.user!;

    const floorLocation = await FloorLocation.findOne({
      _id: id,
      facilityId,
      isDeleted: false
    });

    if (!floorLocation) {
      res.status(404).json(generateResponse(false, 'Floor location not found', 404));
      return;
    }

    floorLocation.isDeleted = true;
    floorLocation.updatedBy = req.user!.userId;
    await floorLocation.save();

    res.status(200).json(generateResponse(true, 'Floor location deleted successfully', 200));
  } catch (error: any) {
    console.error('Error deleting floor location:', error);
    res.status(500).json(generateResponse(false, 'Internal server error', 500));
  }
};