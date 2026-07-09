import * as enquiriesService from './enquiries.service.js';

export const createEnquiry = async (req, res, next) => {
  try {
    const enquiry = await enquiriesService.createEnquiry(req.body);
    res.status(201).json({ success: true, data: enquiry, message: 'Enquiry submitted' });
  } catch (error) {
    next(error);
  }
};

export const listEnquiries = async (req, res, next) => {
  try {
    const enquiries = await enquiriesService.listEnquiries();
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    next(error);
  }
};

export const getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await enquiriesService.getEnquiryById(req.params.id);
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiry = async (req, res, next) => {
  try {
    const enquiry = await enquiriesService.updateEnquiry(req.params.id, req.body);
    res.status(200).json({ success: true, data: enquiry, message: 'Enquiry updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteEnquiry = async (req, res, next) => {
  try {
    await enquiriesService.deleteEnquiry(req.params.id);
    res.status(200).json({ success: true, message: 'Enquiry deleted' });
  } catch (error) {
    next(error);
  }
};
