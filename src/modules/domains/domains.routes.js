import express from 'express';
import * as domainsController from './domains.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// Allow all authenticated users to list domains (for dropdowns)
router.get('/', requireAuth, domainsController.listDomains);
router.get('/:id', requireAuth, domainsController.getDomainById);

// Only admins can modify domains
router.use(requireAuth, requireRole(['super_admin', 'admin']));
router.post('/', domainsController.createDomain);
router.put('/:id', domainsController.updateDomain);
router.delete('/:id', domainsController.deleteDomain);

export default router;
