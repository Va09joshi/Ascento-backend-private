import express from 'express';
import * as domainsController from './domains.controller.js';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Allow all authenticated users to list domains (for dropdowns)
router.get('/', verifyToken, domainsController.listDomains);
router.get('/:id', verifyToken, domainsController.getDomainById);

// Only admins can modify domains
router.use(verifyToken, requireRole('super_admin', 'admin'));
router.post('/', domainsController.createDomain);
router.put('/:id', domainsController.updateDomain);
router.delete('/:id', domainsController.deleteDomain);

export default router;
