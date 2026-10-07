import {
  getCurriculumByCourseService,
  createCurriculumService,
  updateCurriculumService,
  deleteCurriculumService,
} from "../services/curriculum.service.js";
import { curriculumSerializer } from "../serializers/curriculum.serializer.js";

export const getCurriculumByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const curriculum = await getCurriculumByCourseService(courseId);
    const serialized = curriculum.map(curriculumSerializer);

    res.json({
      success: true,
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const createCurriculum = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const curriculum = await createCurriculumService(courseId, req.body);
    const serialized = curriculumSerializer(curriculum);

    res.status(201).json({
      success: true,
      message: "Curriculum created",
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCurriculum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const curriculum = await updateCurriculumService(id, req.body);
    const serialized = curriculumSerializer(curriculum);

    res.json({
      success: true,
      message: "Curriculum updated",
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCurriculum = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteCurriculumService(id);

    res.json({
      success: true,
      message: "Curriculum deleted",
    });
  } catch (err) {
    next(err);
  }
};
