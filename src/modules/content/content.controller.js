import * as contentService from './content.service.js';

export const uploadContent = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file provided' } });
    }
    const content = await contentService.uploadContent(req.file, req.body, req.user.id);
    res.status(201).json({ success: true, data: content, message: 'Content uploaded' });
  } catch (error) { next(error); }
};

export const getContent = async (req, res, next) => {
  try {
    const content = await contentService.getContent(req.query);
    res.status(200).json({ success: true, data: content });
  } catch (error) { next(error); }
};

export const getStreamUrl = async (req, res, next) => {
  try {
    const url = await contentService.getStreamUrl(req.params.id);
    res.status(200).json({ success: true, data: { stream_url: url } });
  } catch (error) { next(error); }
};

export const updateContent = async (req, res, next) => {
  try {
    const content = await contentService.updateContent(req.params.id, req.body);
    res.status(200).json({ success: true, data: content });
  } catch (error) { next(error); }
};

export const deleteContent = async (req, res, next) => {
  try {
    await contentService.deleteContent(req.params.id);
    res.status(200).json({ success: true, message: 'Content deleted' });
  } catch (error) { next(error); }
};
