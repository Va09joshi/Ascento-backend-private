import * as noticesService from './notices.service.js';

export const createNotice = async (req, res, next) => {
  try {
    // Pass req.user.auth_id because the foreign key likely points to auth.users
    const notice = await noticesService.createNotice(req.body, req.file, req.user.auth_id);
    res.status(201).json({ status: 'success', data: notice });
  } catch (error) {
    next(error);
  }
};

export const getNotices = async (req, res, next) => {
  try {
    const isPublic = req.query.published === 'true';
    const notices = await noticesService.getNotices(isPublic);
    res.status(200).json({ status: 'success', data: notices });
  } catch (error) {
    next(error);
  }
};

export const getNoticeById = async (req, res, next) => {
  try {
    const notice = await noticesService.getNoticeById(req.params.id);
    res.status(200).json({ status: 'success', data: notice });
  } catch (error) {
    next(error);
  }
};

export const updateNotice = async (req, res, next) => {
  try {
    const notice = await noticesService.updateNotice(req.params.id, req.body, req.file);
    res.status(200).json({ status: 'success', data: notice });
  } catch (error) {
    next(error);
  }
};

export const deleteNotice = async (req, res, next) => {
  try {
    await noticesService.deleteNotice(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
