import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN } from "../constants/roles.js";
import {
  getAllBlogCategories,
  createBlogCategory,
  getBlogCategoryById,
  updateBlogCategory,
  deleteBlogCategoryById,
} from "../controllers/blog-category.controller.js";
import {
  createBlogCategoryValidation,
  updateBlogCategoryValidation,
  blogCategoryIdValidation,
} from "../validators/blog-category.validator.js";

const router = express.Router();

// GET /api/v1/blog-categories - Get all blog categories
router.get("/", getAllBlogCategories);

// POST /api/v1/blog-categories - Create blog category
router.post(
  "/",
  authenticate,
  authorize(ADMIN),
  createBlogCategoryValidation(),
  createBlogCategory,
);

// GET /api/v1/blog-categories/:id - Get blog category by ID
router.get("/:id", blogCategoryIdValidation(), getBlogCategoryById);

// PATCH /api/v1/blog-categories/:id - Update blog category
router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN),
  blogCategoryIdValidation(),
  updateBlogCategoryValidation(),
  updateBlogCategory,
);

// DELETE /api/v1/blog-categories/:id - Delete blog category
router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN),
  blogCategoryIdValidation(),
  deleteBlogCategoryById,
);

export default router;
