import * as domainsService from './domains.service.js';

export const createDomain = async (req, res, next) => {
  try {
    const domain = await domainsService.createDomain(req.body);
    res.status(201).json({ success: true, data: domain, message: 'Domain created' });
  } catch (error) {
    next(error);
  }
};

export const listDomains = async (req, res, next) => {
  try {
    const domains = await domainsService.listDomains();
    res.status(200).json({ success: true, data: domains });
  } catch (error) {
    next(error);
  }
};

export const getDomainById = async (req, res, next) => {
  try {
    const domain = await domainsService.getDomainById(req.params.id);
    res.status(200).json({ success: true, data: domain });
  } catch (error) {
    next(error);
  }
};

export const updateDomain = async (req, res, next) => {
  try {
    const domain = await domainsService.updateDomain(req.params.id, req.body);
    res.status(200).json({ success: true, data: domain, message: 'Domain updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteDomain = async (req, res, next) => {
  try {
    await domainsService.deleteDomain(req.params.id);
    res.status(200).json({ success: true, message: 'Domain deleted' });
  } catch (error) {
    next(error);
  }
};
