import * as feesService from './fees.service.js';

export const createFeeStructure = async (req, res, next) => {
  try {
    const feeStructure = await feesService.createFeeStructure(req.body);
    res.status(201).json({ success: true, data: feeStructure, message: 'Fee structure created' });
  } catch (error) {
    next(error);
  }
};

export const listFeeStructures = async (req, res, next) => {
  try {
    const feeStructures = await feesService.listFeeStructures();
    res.status(200).json({ success: true, data: feeStructures });
  } catch (error) {
    next(error);
  }
};

export const createFeeRecord = async (req, res, next) => {
  try {
    const feeRecord = await feesService.createFeeRecord(req.body);
    res.status(201).json({ success: true, data: feeRecord, message: 'Fee record created' });
  } catch (error) {
    next(error);
  }
};

export const listFeeRecords = async (req, res, next) => {
  try {
    const feeRecords = await feesService.listFeeRecords();
    res.status(200).json({ success: true, data: feeRecords });
  } catch (error) {
    next(error);
  }
};

export const updateFeeRecord = async (req, res, next) => {
  try {
    const feeRecord = await feesService.updateFeeRecord(req.params.id, req.body);
    res.status(200).json({ success: true, data: feeRecord, message: 'Fee record updated' });
  } catch (error) {
    next(error);
  }
};
