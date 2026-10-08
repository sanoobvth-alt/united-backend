import multer from 'multer';
import { mkdir, unlink, readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';

const uploadRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'public/uploads');
const extensions = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png' };
const signatures = {
  'application/pdf': (b) => b.subarray(0, 5).toString() === '%PDF-',
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
};
const metadataSchema = z.object({
  type: z.string().trim().min(1),
  customerId: z.string().uuid().optional(),
  policyId: z.string().uuid().optional(),
  claimId: z.string().uuid().optional(),
}).strict().refine((data) => data.customerId || data.policyId || data.claimId, 'Link the document to a customer, policy, or claim');

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    mkdir(uploadRoot, { recursive: true }).then(() => callback(null, uploadRoot), callback);
  },
  filename(_req, file, callback) {
    callback(null, `${randomUUID()}${extensions[file.mimetype] || '.bin'}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_UPLOAD_SIZE_BYTES || 5 * 1024 * 1024), files: 1 },
  fileFilter(_req, file, callback) {
    if (!extensions[file.mimetype]) return callback(new ApiError(400, 'Only PDF, JPEG, and PNG files are allowed'));
    callback(null, true);
  },
});

export function uploadDocument(req, _res, next) {
  upload.single('file')(req, _res, async (uploadError) => {
    if (uploadError) return next(uploadError instanceof multer.MulterError ? new ApiError(400, uploadError.message) : uploadError);
    const result = metadataSchema.safeParse(req.body);
    if (!result.success) {
      if (req.file) await unlink(req.file.path).catch(() => {});
      return next(result.error);
    }
    if (!req.file) return next(new ApiError(400, 'A document file is required'));
    const header = await readFile(req.file.path).then((buffer) => buffer.subarray(0, 8)).catch(() => Buffer.alloc(0));
    if (!signatures[req.file.mimetype](header)) {
      await unlink(req.file.path).catch(() => {});
      return next(new ApiError(400, 'File content does not match its declared type'));
    }
    req.documentMetadata = result.data;
    next();
  });
}

export const getUploadPath = (fileName) => {
  const safeName = path.basename(fileName);
  const resolved = path.resolve(uploadRoot, safeName);
  if (!resolved.startsWith(`${uploadRoot}${path.sep}`)) throw new ApiError(400, 'Invalid document file reference');
  return resolved;
};

export const removeUploadedFile = (filePath) => unlink(filePath).catch(() => {});
