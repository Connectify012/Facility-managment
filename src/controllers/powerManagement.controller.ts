import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { IPowerManagement, PowerManagement } from '../models/PowerManagement';

const generateResponse = (success: boolean, message: string, data?: any, error?: any) => ({
  success,
  message,
  ...(data && { data }),
  ...(error && { error })
});

export const createPowerManagement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const powerManagementData: Partial<IPowerManagement> = req.body;
    
    const powerManagement = new PowerManagement(powerManagementData);
    await powerManagement.save();

    res.status(201).json(generateResponse(
      true,
      'Power management configuration created successfully',
      powerManagement
    ));
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json(generateResponse(
        false,
        'Meter ID already exists',
        null,
        error.message
      ));
    } else {
      res.status(500).json(generateResponse(
        false,
        'Error creating power management configuration',
        null,
        error.message
      ));
    }
  }
};

export const getAllPowerManagement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, facilityId } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (facilityId) filter.facilityId = facilityId;

    const skip = (Number(page) - 1) * Number(limit);
    
    const powerManagements = await PowerManagement
      .find(filter)
      .populate('facilityId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await PowerManagement.countDocuments(filter);

    res.status(200).json(generateResponse(
      true,
      'Power management configurations retrieved successfully',
      {
        powerManagements,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error retrieving power management configurations',
      null,
      error.message
    ));
  }
};

export const getPowerManagementById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const powerManagement = await PowerManagement
      .findById(id)
      .populate('facilityId', 'name');

    if (!powerManagement) {
      res.status(404).json(generateResponse(
        false,
        'Power management configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Power management configuration retrieved successfully',
      powerManagement
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error retrieving power management configuration',
      null,
      error.message
    ));
  }
};

export const updatePowerManagement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const powerManagement = await PowerManagement
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('facilityId', 'name');

    if (!powerManagement) {
      res.status(404).json(generateResponse(
        false,
        'Power management configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Power management configuration updated successfully',
      powerManagement
    ));
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json(generateResponse(
        false,
        'Meter ID already exists',
        null,
        error.message
      ));
    } else {
      res.status(500).json(generateResponse(
        false,
        'Error updating power management configuration',
        null,
        error.message
      ));
    }
  }
};

export const deletePowerManagement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const powerManagement = await PowerManagement.findByIdAndDelete(id);

    if (!powerManagement) {
      res.status(404).json(generateResponse(
        false,
        'Power management configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Power management configuration deleted successfully'
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error deleting power management configuration',
      null,
      error.message
    ));
  }
};