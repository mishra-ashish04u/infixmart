import multer from "multer";
import path from "path";
import sharp from "sharp";
import { ensureUploadsDir, uploadsDir } from "../config/uploads.js";

const memoryStorage = multer.memoryStorage();

const baseUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files (JPEG, PNG, WebP, GIF) are allowed"));
  },
});

const processImage = async (file) => {
  ensureUploadsDir();
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.webp`;
  const filepath = path.join(uploadsDir, filename);
  await sharp(file.buffer).webp({ quality: 80 }).toFile(filepath);

  // Morph to look like diskStorage
  file.filename = filename;
  file.path = filepath;
  file.destination = uploadsDir;
  file.mimetype = "image/webp";
  delete file.buffer; // Free up memory immediately
};

const optimizeImagesMiddleware = async (req, res, next) => {
  if (!req.files && !req.file) return next();
  try {
    if (req.file) {
      await processImage(req.file);
    }
    if (Array.isArray(req.files)) {
      await Promise.all(req.files.map(processImage));
    } else if (typeof req.files === "object") {
      const allFiles = Object.values(req.files).flat();
      await Promise.all(allFiles.map(processImage));
    }
    next();
  } catch (err) {
    console.error("[SHARP ERROR]", err);
    next(err);
  }
};

const upload = {
  single: (field) => [baseUpload.single(field), optimizeImagesMiddleware],
  array: (field, max) => [baseUpload.array(field, max), optimizeImagesMiddleware],
  fields: (arr) => [baseUpload.fields(arr), optimizeImagesMiddleware],
};

export default upload;
