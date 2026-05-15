import path from 'path';
import fs from 'fs';
import multer from 'multer';

const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `profile-${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/i;
  const ext = path.extname(file.originalname).toLowerCase();
  const ok = allowed.test(ext) && allowed.test(file.mimetype);
  if (ok) cb(null, true);
  else cb(new Error('Only image files (jpeg, png, gif, webp) are allowed'));
};

export const uploadProfileImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

/** Public URL path segment for stored files */
export const uploadsPublicPath = '/uploads';
