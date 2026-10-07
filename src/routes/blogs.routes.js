import express from "express";
import createUploader from "../middlewares/upload.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN, INSTRUCTOR } from "../constants/roles.js";
import {
  getAllBlogs,
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
  getAllTags,
} from "../controllers/blog.controller.js";
import {
  createBlogValidation,
  updateBlogValidation,
  blogIdValidation,
} from "../validators/blog.validator.js";

const router = express.Router();
const uploadBlog = createUploader("blogs");

router.get("/", getAllBlogs);

router.get("/tags", getAllTags);

router.post(
  "/",
  authenticate,
  authorize(ADMIN, INSTRUCTOR),
  uploadBlog.single("image"),
  createBlogValidation(),
  createBlog,
);

router.get("/:id", blogIdValidation(), getBlogById);

router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN, INSTRUCTOR),
  blogIdValidation(),
  uploadBlog.single("image"),
  updateBlogValidation(),
  updateBlog,
);

router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN),
  blogIdValidation(),
  deleteBlog,
);

export default router;
