import multer from 'multer';

// Store files in memory
const storage = multer.memoryStorage();

// Validate image files
const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/i;

  const ext = file.originalname
    .split('.')
    .pop()
    ?.toLowerCase();

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

export const uploadProfileImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});