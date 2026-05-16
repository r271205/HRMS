import multer from 'multer';

// Store files in memory instead of local disk
const storage = multer.memoryStorage();

// File filter for image validation
const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/i;

  // Get file extension
  const ext = file.originalname
    .split('.')
    .pop()
    ?.toLowerCase();

  // Validate extension + mimetype
  const isValid =
    allowed.test(ext || '') &&
    allowed.test(file.mimetype);

  if (isValid) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only image files (jpeg, jpg, png, gif, webp) are allowed'
      )
    );
  }
};

// Multer upload middleware
export const uploadProfileImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});