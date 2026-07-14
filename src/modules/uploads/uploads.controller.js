import { supabaseAdmin } from '../../config/supabase.js';
import crypto from 'crypto';

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file provided' } });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'ascento-storage')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'ascento-storage')
      .getPublicUrl(filePath);

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { url: publicUrlData.publicUrl }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file provided' } });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'ascento-storage')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'ascento-storage')
      .getPublicUrl(filePath);

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { url: publicUrlData.publicUrl }
    });
  } catch (error) {
    next(error);
  }
};
