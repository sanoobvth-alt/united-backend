import { validationResult } from "express-validator";
import fs from "fs";
import path from "path";

const generateFormError = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        const filePath = path.join(process.cwd(), "public", req.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(400).json({
        success: false,
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  } catch (error) {
    console.log(error, "===");
  }
};

export default generateFormError;
