import ApiError from "../utils/ApiError.js";
import {
  getAllCourseCategoriesService,
  createCourseCategoryService,
  getCourseCategoryByIdService,
  updateCourseCategoryService,
  deleteCourseCategoryByIdService,
  getAllBlogCategoriesService,
  createBlogCategoryService,
  getBlogCategoryByIdService,
  updateBlogCategoryService,
  deleteBlogCategoryByIdService,
} from "../services/category.service.js";

// Course Categories
export const getAllCourseCategories = async (req, res, next) => {
  try {
    const result = await getAllCourseCategoriesService(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const createCourseCategory = async (req, res, next) => {
  try {
    const data = await createCourseCategoryService(req.body, req.user?.id);
    res
      .status(201)
      .json({ success: true, message: "Course category created", data });
  } catch (err) {
    next(err);
  }
};

export const getCourseCategoryById = async (req, res, next) => {
  try {
    const data = await getCourseCategoryByIdService(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateCourseCategory = async (req, res, next) => {
  try {
    const data = await updateCourseCategoryService(
      req.params.id,
      req.body,
      req.user?.id,
    );
    res.json({ success: true, message: "Course category updated", data });
  } catch (err) {
    next(err);
  }
};

export const deleteCourseCategoryById = async (req, res, next) => {
  try {
    await deleteCourseCategoryByIdService(req.params.id);
    res.json({ success: true, message: "Course category deleted" });
  } catch (err) {
    next(err);
  }
};

// Blog Categories
export const getAllBlogCategories = async (req, res, next) => {
  try {
    const data = await getAllBlogCategoriesService();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createBlogCategory = async (req, res, next) => {
  try {
    const data = await createBlogCategoryService(req.body);
    res
      .status(201)
      .json({ success: true, message: "Blog category created", data });
  } catch (err) {
    next(err);
  }
};

export const getBlogCategoryById = async (req, res, next) => {
  try {
    const data = await getBlogCategoryByIdService(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateBlogCategory = async (req, res, next) => {
  try {
    const data = await updateBlogCategoryService(req.params.id, req.body);
    res.json({ success: true, message: "Blog category updated", data });
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
