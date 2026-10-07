import ApiError from "../utils/ApiError.js";
import {
  getAllBlogCategoriesService,
  createBlogCategoryService,
  getBlogCategoryByIdService,
  updateBlogCategoryService,
  deleteBlogCategoryByIdService,
} from "../services/blog-category.service.js";
import { blogCategorySerializer } from "../serializers/blog-category.serializer.js";

export const getAllBlogCategories = async (req, res, next) => {
  try {
    const result = await getAllBlogCategoriesService();
    result.data = result.data.map(blogCategorySerializer);
    res.json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

export const createBlogCategory = async (req, res, next) => {
  try {
    const data = await createBlogCategoryService(req.body);
    const serialized = blogCategorySerializer(data);
    res.status(201).json({
      success: true,
      message: "Blog category created",
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const getBlogCategoryById = async (req, res, next) => {
  try {
    const data = await getBlogCategoryByIdService(req.params.id);
    const serialized = blogCategorySerializer(data);
    res.json({ success: true, data: serialized });
  } catch (err) {
    next(err);
  }
};

export const updateBlogCategory = async (req, res, next) => {
  try {
    const data = await updateBlogCategoryService(req.params.id, req.body);
    const serialized = blogCategorySerializer(data);
    res.json({
      success: true,
      message: "Blog category updated",
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBlogCategoryById = async (req, res, next) => {
  try {
    await deleteBlogCategoryByIdService(req.params.id);
    res.json({ success: true, message: "Blog category deleted" });
  } catch (err) {
    next(err);
  }
};
