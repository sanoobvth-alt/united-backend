import ApiError from "../utils/ApiError.js";
import {
  getAllCourseCategoriesService,
  createCourseCategoryService,
  getCourseCategoryByIdService,
  updateCourseCategoryService,
  deleteCourseCategoryByIdService,
} from "../services/course-category.service.js";
import { courseCategorySerializer } from "../serializers/course-category.serializer.js";

export const getAllCourseCategories = async (req, res, next) => {
  try {
    const result = await getAllCourseCategoriesService();
    result.data = result.data.map(courseCategorySerializer);
    res.json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

export const createCourseCategory = async (req, res, next) => {
  try {
    const data = await createCourseCategoryService(
      req.body,
      req.fileUrl,
      req.user.id,
    );
    const serialized = courseCategorySerializer(data);
    res.status(201).json({
      success: true,
      message: "Course category created",
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const getCourseCategoryById = async (req, res, next) => {
  try {
    const data = await getCourseCategoryByIdService(req.params.id);
    const serialized = courseCategorySerializer(data);
    res.json({ success: true, data: serialized });
  } catch (err) {
    next(err);
  }
};

export const updateCourseCategory = async (req, res, next) => {
  try {
    const data = await updateCourseCategoryService(
      req.params.id,
      req.body,
      req.fileUrl,
      req.user.id,
    );
    const serialized = courseCategorySerializer(data);
    res.json({
      success: true,
      message: "Course category updated",
      data: serialized,
    });
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
