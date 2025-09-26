import { Response } from 'express';
import { STP, WTP, SwimmingPool, ROPlant, ISTP, IWTP, ISwimmingPool, IROPlant } from '../models/QualityManagement';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const generateResponse = (success: boolean, message: string, data?: any, error?: any) => ({
  success,
  message,
  ...(data && { data }),
  ...(error && { error })
});

// STP Controllers
export const createSTP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stpData: Partial<ISTP> = req.body;
    
    const stp = new STP(stpData);
    await stp.save();

    res.status(201).json(generateResponse(
      true,
      'STP configuration created successfully',
      stp
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error creating STP configuration',
      null,
      error.message
    ));
  }
};

export const getAllSTP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, facilityId } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (facilityId) filter.facilityId = facilityId;

    const skip = (Number(page) - 1) * Number(limit);
    
    const stps = await STP
      .find(filter)
      .populate('facilityId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await STP.countDocuments(filter);

    res.status(200).json(generateResponse(
      true,
      'STP configurations retrieved successfully',
      {
        stps,
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
      'Error retrieving STP configurations',
      null,
      error.message
    ));
  }
};

export const getSTPById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const stp = await STP
      .findById(id)
      .populate('facilityId', 'name');

    if (!stp) {
      res.status(404).json(generateResponse(
        false,
        'STP configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'STP configuration retrieved successfully',
      stp
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error retrieving STP configuration',
      null,
      error.message
    ));
  }
};

export const updateSTP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const stp = await STP
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('facilityId', 'name');

    if (!stp) {
      res.status(404).json(generateResponse(
        false,
        'STP configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'STP configuration updated successfully',
      stp
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error updating STP configuration',
      null,
      error.message
    ));
  }
};

export const deleteSTP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const stp = await STP.findByIdAndDelete(id);

    if (!stp) {
      res.status(404).json(generateResponse(
        false,
        'STP configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'STP configuration deleted successfully'
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error deleting STP configuration',
      null,
      error.message
    ));
  }
};

// WTP Controllers
export const createWTP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const wtpData: Partial<IWTP> = req.body;
    
    const wtp = new WTP(wtpData);
    await wtp.save();

    res.status(201).json(generateResponse(
      true,
      'WTP configuration created successfully',
      wtp
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error creating WTP configuration',
      null,
      error.message
    ));
  }
};

export const getAllWTP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, facilityId } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (facilityId) filter.facilityId = facilityId;

    const skip = (Number(page) - 1) * Number(limit);
    
    const wtps = await WTP
      .find(filter)
      .populate('facilityId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await WTP.countDocuments(filter);

    res.status(200).json(generateResponse(
      true,
      'WTP configurations retrieved successfully',
      {
        wtps,
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
      'Error retrieving WTP configurations',
      null,
      error.message
    ));
  }
};

export const getWTPById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const wtp = await WTP
      .findById(id)
      .populate('facilityId', 'name');

    if (!wtp) {
      res.status(404).json(generateResponse(
        false,
        'WTP configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'WTP configuration retrieved successfully',
      wtp
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error retrieving WTP configuration',
      null,
      error.message
    ));
  }
};

export const updateWTP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const wtp = await WTP
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('facilityId', 'name');

    if (!wtp) {
      res.status(404).json(generateResponse(
        false,
        'WTP configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'WTP configuration updated successfully',
      wtp
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error updating WTP configuration',
      null,
      error.message
    ));
  }
};

export const deleteWTP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const wtp = await WTP.findByIdAndDelete(id);

    if (!wtp) {
      res.status(404).json(generateResponse(
        false,
        'WTP configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'WTP configuration deleted successfully'
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error deleting WTP configuration',
      null,
      error.message
    ));
  }
};

// Swimming Pool Controllers
export const createSwimmingPool = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const poolData: Partial<ISwimmingPool> = req.body;
    
    const pool = new SwimmingPool(poolData);
    await pool.save();

    res.status(201).json(generateResponse(
      true,
      'Swimming pool configuration created successfully',
      pool
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error creating swimming pool configuration',
      null,
      error.message
    ));
  }
};

export const getAllSwimmingPools = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, facilityId } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (facilityId) filter.facilityId = facilityId;

    const skip = (Number(page) - 1) * Number(limit);
    
    const pools = await SwimmingPool
      .find(filter)
      .populate('facilityId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await SwimmingPool.countDocuments(filter);

    res.status(200).json(generateResponse(
      true,
      'Swimming pool configurations retrieved successfully',
      {
        pools,
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
      'Error retrieving swimming pool configurations',
      null,
      error.message
    ));
  }
};

export const getSwimmingPoolById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const pool = await SwimmingPool
      .findById(id)
      .populate('facilityId', 'name');

    if (!pool) {
      res.status(404).json(generateResponse(
        false,
        'Swimming pool configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Swimming pool configuration retrieved successfully',
      pool
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error retrieving swimming pool configuration',
      null,
      error.message
    ));
  }
};

export const updateSwimmingPool = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const pool = await SwimmingPool
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('facilityId', 'name');

    if (!pool) {
      res.status(404).json(generateResponse(
        false,
        'Swimming pool configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Swimming pool configuration updated successfully',
      pool
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error updating swimming pool configuration',
      null,
      error.message
    ));
  }
};

export const deleteSwimmingPool = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const pool = await SwimmingPool.findByIdAndDelete(id);

    if (!pool) {
      res.status(404).json(generateResponse(
        false,
        'Swimming pool configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Swimming pool configuration deleted successfully'
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error deleting swimming pool configuration',
      null,
      error.message
    ));
  }
};

// RO Plant Controllers
export const createROPlant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const roData: Partial<IROPlant> = req.body;
    
    const ro = new ROPlant(roData);
    await ro.save();

    res.status(201).json(generateResponse(
      true,
      'RO plant configuration created successfully',
      ro
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error creating RO plant configuration',
      null,
      error.message
    ));
  }
};

export const getAllROPlants = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, facilityId } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (facilityId) filter.facilityId = facilityId;

    const skip = (Number(page) - 1) * Number(limit);
    
    const roPlants = await ROPlant
      .find(filter)
      .populate('facilityId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ROPlant.countDocuments(filter);

    res.status(200).json(generateResponse(
      true,
      'RO plant configurations retrieved successfully',
      {
        roPlants,
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
      'Error retrieving RO plant configurations',
      null,
      error.message
    ));
  }
};

export const getROPlantById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const ro = await ROPlant
      .findById(id)
      .populate('facilityId', 'name');

    if (!ro) {
      res.status(404).json(generateResponse(
        false,
        'RO plant configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'RO plant configuration retrieved successfully',
      ro
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error retrieving RO plant configuration',
      null,
      error.message
    ));
  }
};

export const updateROPlant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const ro = await ROPlant
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('facilityId', 'name');

    if (!ro) {
      res.status(404).json(generateResponse(
        false,
        'RO plant configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'RO plant configuration updated successfully',
      ro
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error updating RO plant configuration',
      null,
      error.message
    ));
  }
};

export const deleteROPlant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ro = await ROPlant.findByIdAndDelete(id);

    if (!ro) {
      res.status(404).json(generateResponse(
        false,
        'RO plant configuration not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'RO plant configuration deleted successfully'
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error deleting RO plant configuration',
      null,
      error.message
    ));
  }
};