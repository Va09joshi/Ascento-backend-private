import * as adminService from './admin.service.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const { branch_id } = req.query;
    // Both Admin and Super Admin can view specific branch or all
    const targetBranch = branch_id;
    
    const stats = await adminService.getDashboardStats(targetBranch);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
