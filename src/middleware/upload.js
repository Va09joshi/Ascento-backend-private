import multer from 'multer';
import os from 'os';

// Memory storage for CSVs and smaller files we process in memory
const memoryStorage = multer.memoryStorage();

// Disk storage for large files to prevent RAM exhaustion
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

// Multer upload instances with size limits
export const uploadMemory = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for CSVs and small avatars
  },
});

export const uploadVideo = multer({
  storage: diskStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
});

export const uploadPdf = multer({
  storage: diskStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for PDFs
  },
});
