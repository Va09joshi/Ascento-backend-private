import { supabaseAdmin } from '../../config/supabase.js';
import crypto from 'crypto';
import fs from 'fs';

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file provided' } });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const fileData = req.file.path ? fs.readFileSync(req.file.path) : req.file.buffer;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'ascento-storage')
      .upload(filePath, fileData, {
        contentType: req.file.mimetype,
      });

    if (req.file.path) {
      fs.unlinkSync(req.file.path); // cleanup temp file
    }

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

    const fileData = req.file.path ? fs.readFileSync(req.file.path) : req.file.buffer;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'ascento-storage')
      .upload(filePath, fileData, {
        contentType: req.file.mimetype,
      });

    if (req.file.path) {
      fs.unlinkSync(req.file.path); // cleanup temp file
    }

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
