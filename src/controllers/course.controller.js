import {
  createCourseService,
  getAllCoursesService,
  getCourseByIdService,
  updateCourseService,
  deleteCourseService,
  deleteAllCurriculumAndOverviewService,
} from "../services/course.service.js";
import ApiError from "../utils/ApiError.js";
import { courseSerializer } from "../serializers/course.serializer.js";

export const getAllCourses = async (req, res, next) => {
  try {
    const result = await getAllCoursesService(req.query);
    result.data = result.data.map(courseSerializer);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const imagePath = req.fileUrl || undefined;
    const course = await createCourseService(req.body, req.user.id, imagePath);
    const serialized = courseSerializer(course);
    res.status(201).json({ success: true, data: serialized });
  } catch (err) {
    next(err);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const courses = await getAllCoursesService(req.query);
    courses.data = courses.data.map(courseSerializer);

    res.json({ success: true, courses });
  } catch (err) {
    next(err);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await getCourseByIdService(id);
    const serialized = courseSerializer(course);
    res.json({ success: true, data: serialized });
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const imagePath = req.fileUrl || undefined;
    const course = await updateCourseService(
      id,
      req.body,
      req.user.id,
      imagePath,
    );
    const serialized = courseSerializer(course);
    res.json({ success: true, message: "Course updated", data: serialized });
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteCourseService(id, req.user.id);
    res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    next(err);
  }
};

export const deleteAllCurriculumAndOverview = async (req, res, next) => {
  try {
    const result = await deleteAllCurriculumAndOverviewService(req.user.id);
    res.json({
      success: true,
      message: "All curriculum and overview deleted",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export { createCourse, getCourses };
