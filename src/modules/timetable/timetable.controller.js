import * as timetableService from './timetable.service.js';
import { redisConnection } from '../../config/redis.js';

export const createPeriod = async (req, res, next) => {
  try {
    const period = await timetableService.createPeriod(req.body);
    
    // Invalidate cache
    await redisConnection.del(`timetable:section:${req.body.section_id}`);
    
    res.status(201).json({ success: true, data: period, message: 'Timetable period created' });
  } catch (error) {
    if (error.code === 'TIMETABLE_CLASH') {
      return res.status(409).json({ success: false, error });
    }
    next(error);
  }
};

export const updatePeriod = async (req, res, next) => {
  try {
    const period = await timetableService.updatePeriod(req.params.id, req.body);
    
    // Invalidate cache
    await redisConnection.del(`timetable:section:${req.body.section_id}`);
    
    res.status(200).json({ success: true, data: period, message: 'Timetable period updated' });
  } catch (error) {
    if (error.code === 'TIMETABLE_CLASH') {
      return res.status(409).json({ success: false, error });
    }
    next(error);
  }
};

export const getSectionTimetable = async (req, res, next) => {
  try {
    const { section_id, academic_year_id } = req.query;
    
    if (!section_id) {
      return res.status(400).json({ success: false, error: { message: 'section_id is required' } });
    }

    const cacheKey = `timetable:section:${section_id}${academic_year_id ? `:${academic_year_id}` : ''}`;
    
    // Try cache first
    const cached = await redisConnection.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: JSON.parse(cached), source: 'cache' });
    }

    const timetable = await timetableService.getSectionTimetable(section_id, academic_year_id);
    
    // Cache for 1 hour
    await redisConnection.setex(cacheKey, 3600, JSON.stringify(timetable));
    
    res.status(200).json({ success: true, data: timetable });
  } catch (error) {
    next(error);
  }
};

export const deletePeriod = async (req, res, next) => {
  try {
    // In a real scenario, we'd fetch the period first to know which section cache to invalidate
    await timetableService.deletePeriod(req.params.id);
    res.status(200).json({ success: true, message: 'Timetable period deleted' });
  } catch (error) {
    next(error);
  }
};
