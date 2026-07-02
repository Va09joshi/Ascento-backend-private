import * as branchService from './branches.service.js';

export const createBranch = async (req, res, next) => {
  try {
    const branch = await branchService.createBranch(req.body);
    res.status(201).json({ success: true, data: branch, message: 'Branch created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllBranches = async (req, res, next) => {
  try {
    const branches = await branchService.getAllBranches();
    res.status(200).json({ success: true, data: branches });
  } catch (error) {
    next(error);
  }
};

export const getBranchById = async (req, res, next) => {
  try {
    const branch = await branchService.getBranchById(req.params.id);
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (req, res, next) => {
  try {
    const branch = await branchService.updateBranch(req.params.id, req.body);
    res.status(200).json({ success: true, data: branch, message: 'Branch updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteBranch = async (req, res, next) => {
  try {
    await branchService.deleteBranch(req.params.id);
    res.status(200).json({ success: true, message: 'Branch deleted (deactivated) successfully' });
  } catch (error) {
    next(error);
  }
};
