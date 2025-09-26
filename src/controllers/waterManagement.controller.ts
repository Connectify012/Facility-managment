import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Borewell, Cauvery, IBorewell, ICauvery, ITanker, IWaterTank, Tanker, WaterTank } from '../models/WaterManagement';

const generateResponse = (success: boolean, message: string, data?: any, error?: any) => ({
  success,
  message,
  ...(data && { data }),
  ...(error && { error })
});

// Water Tank Controllers
export const createWaterTank = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const waterTankData: Partial<IWaterTank> = req.body;
    
    const waterTank = new WaterTank(waterTankData);
    await waterTank.save();

    res.status(201).json(generateResponse(
      true,
      'Water tank created successfully',
      waterTank
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error creating water tank',
      null,
      error.message
    ));
  }
};

export const getAllWaterTanks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, facilityId, type } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (facilityId) filter.facilityId = facilityId;
    if (type) filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    
    const waterTanks = await WaterTank
      .find(filter)
      .populate('facilityId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await WaterTank.countDocuments(filter);

    res.status(200).json(generateResponse(
      true,
      'Water tanks retrieved successfully',
      {
        waterTanks,
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
      'Error retrieving water tanks',
      null,
      error.message
    ));
  }
};

export const getWaterTankById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const waterTank = await WaterTank
      .findById(id)
      .populate('facilityId', 'name');

    if (!waterTank) {
      res.status(404).json(generateResponse(
        false,
        'Water tank not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Water tank retrieved successfully',
      waterTank
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error retrieving water tank',
      null,
      error.message
    ));
  }
};

export const updateWaterTank = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const waterTank = await WaterTank
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('facilityId', 'name');

    if (!waterTank) {
      res.status(404).json(generateResponse(
        false,
        'Water tank not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Water tank updated successfully',
      waterTank
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error updating water tank',
      null,
      error.message
    ));
  }
};

export const deleteWaterTank = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const waterTank = await WaterTank.findByIdAndDelete(id);

    if (!waterTank) {
      res.status(404).json(generateResponse(
        false,
        'Water tank not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Water tank deleted successfully'
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error deleting water tank',
      null,
      error.message
    ));
  }
};

// Borewell Controllers
export const createBorewell = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const borewellData: Partial<IBorewell> = req.body;
    
    const borewell = new Borewell(borewellData);
    await borewell.save();

    res.status(201).json(generateResponse(
      true,
      'Borewell created successfully',
      borewell
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error creating borewell',
      null,
      error.message
    ));
  }
};

export const getAllBorewells = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, facilityId } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (facilityId) filter.facilityId = facilityId;

    const skip = (Number(page) - 1) * Number(limit);
    
    const borewells = await Borewell
      .find(filter)
      .populate('facilityId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Borewell.countDocuments(filter);

    res.status(200).json(generateResponse(
      true,
      'Borewells retrieved successfully',
      {
        borewells,
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
      'Error retrieving borewells',
      null,
      error.message
    ));
  }
};

export const getBorewellById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const borewell = await Borewell
      .findById(id)
      .populate('facilityId', 'name');

    if (!borewell) {
      res.status(404).json(generateResponse(
        false,
        'Borewell not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Borewell retrieved successfully',
      borewell
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error retrieving borewell',
      null,
      error.message
    ));
  }
};

export const updateBorewell = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const borewell = await Borewell
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('facilityId', 'name');

    if (!borewell) {
      res.status(404).json(generateResponse(
        false,
        'Borewell not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Borewell updated successfully',
      borewell
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error updating borewell',
      null,
      error.message
    ));
  }
};

export const deleteBorewell = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const borewell = await Borewell.findByIdAndDelete(id);

    if (!borewell) {
      res.status(404).json(generateResponse(
        false,
        'Borewell not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Borewell deleted successfully'
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error deleting borewell',
      null,
      error.message
    ));
  }
};

// Cauvery Controllers
export const createCauvery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const cauveryData: Partial<ICauvery> = req.body;
    
    const cauvery = new Cauvery(cauveryData);
    await cauvery.save();

    res.status(201).json(generateResponse(
      true,
      'Cauvery data created successfully',
      cauvery
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error creating cauvery data',
      null,
      error.message
    ));
  }
};

export const getAllCauvery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, facilityId } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (facilityId) filter.facilityId = facilityId;

    const skip = (Number(page) - 1) * Number(limit);
    
    const cauveryData = await Cauvery
      .find(filter)
      .populate('facilityId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Cauvery.countDocuments(filter);

    res.status(200).json(generateResponse(
      true,
      'Cauvery data retrieved successfully',
      {
        cauveryData,
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
      'Error retrieving cauvery data',
      null,
      error.message
    ));
  }
};

export const getCauveryById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const cauvery = await Cauvery
      .findById(id)
      .populate('facilityId', 'name');

    if (!cauvery) {
      res.status(404).json(generateResponse(
        false,
        'Cauvery data not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Cauvery data retrieved successfully',
      cauvery
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error retrieving cauvery data',
      null,
      error.message
    ));
  }
};

export const updateCauvery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const cauvery = await Cauvery
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('facilityId', 'name');

    if (!cauvery) {
      res.status(404).json(generateResponse(
        false,
        'Cauvery data not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Cauvery data updated successfully',
      cauvery
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error updating cauvery data',
      null,
      error.message
    ));
  }
};

export const deleteCauvery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cauvery = await Cauvery.findByIdAndDelete(id);

    if (!cauvery) {
      res.status(404).json(generateResponse(
        false,
        'Cauvery data not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Cauvery data deleted successfully'
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error deleting cauvery data',
      null,
      error.message
    ));
  }
};

// Tanker Controllers
export const createTanker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tankerData: Partial<ITanker> = req.body;
    
    const tanker = new Tanker(tankerData);
    await tanker.save();

    res.status(201).json(generateResponse(
      true,
      'Tanker data created successfully',
      tanker
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error creating tanker data',
      null,
      error.message
    ));
  }
};

export const getAllTankers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, facilityId } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (facilityId) filter.facilityId = facilityId;

    const skip = (Number(page) - 1) * Number(limit);
    
    const tankers = await Tanker
      .find(filter)
      .populate('facilityId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Tanker.countDocuments(filter);

    res.status(200).json(generateResponse(
      true,
      'Tanker data retrieved successfully',
      {
        tankers,
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
      'Error retrieving tanker data',
      null,
      error.message
    ));
  }
};

export const getTankerById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const tanker = await Tanker
      .findById(id)
      .populate('facilityId', 'name');

    if (!tanker) {
      res.status(404).json(generateResponse(
        false,
        'Tanker data not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Tanker data retrieved successfully',
      tanker
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error retrieving tanker data',
      null,
      error.message
    ));
  }
};

export const updateTanker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const tanker = await Tanker
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('facilityId', 'name');

    if (!tanker) {
      res.status(404).json(generateResponse(
        false,
        'Tanker data not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Tanker data updated successfully',
      tanker
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error updating tanker data',
      null,
      error.message
    ));
  }
};

export const deleteTanker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const tanker = await Tanker.findByIdAndDelete(id);

    if (!tanker) {
      res.status(404).json(generateResponse(
        false,
        'Tanker data not found'
      ));
      return;
    }

    res.status(200).json(generateResponse(
      true,
      'Tanker data deleted successfully'
    ));
  } catch (error: any) {
    res.status(500).json(generateResponse(
      false,
      'Error deleting tanker data',
      null,
      error.message
    ));
  }
};