import multer from "multer";
import path from "path";
import fs from "fs";

const createUploader = (folderName = "general") => {
  const uploadDir = path.join(process.cwd(), "public", "uploads", folderName);

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const baseName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();

      const uniqueName = `${Date.now()}-${baseName}${ext}`;

      // Public URL path stored in DB
      req.fileUrl = `/uploads/${folderName}/${uniqueName}`;

      cb(null, uniqueName);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed"));
      }
      cb(null, true);
    },
  });
};

export default createUploader;
