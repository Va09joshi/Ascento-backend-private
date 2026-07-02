import multer from 'multer';

// Memory storage for CSVs and smaller files we process in memory
const memoryStorage = multer.memoryStorage();

// Multer upload instances with size limits
export const uploadMemory = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for CSVs and small avatars
  },
});

export const uploadVideo = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
});

export const uploadPdf = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for PDFs
  },
});
