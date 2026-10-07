import {
  getOverviewByCourseService,
  createOverviewService,
  updateOverviewService,
  deleteOverviewService,
} from "../services/overview.service.js";
import { overviewSerializer } from "../serializers/overview.serializer.js";

export const getOverviewByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const overviews = await getOverviewByCourseService(courseId);
    const serialized = overviews.map(overviewSerializer);

    res.json({
      success: true,
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const createOverview = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const overview = await createOverviewService(courseId, req.body);
    const serialized = overviewSerializer(overview);

    res.status(201).json({
      success: true,
      message: "Overview created",
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const updateOverview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const overview = await updateOverviewService(id, req.body);
    const serialized = overviewSerializer(overview);

    res.json({
      success: true,
      message: "Overview updated",
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteOverview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteOverviewService(id);

    res.json({
      success: true,
      message: "Overview deleted",
    });
  } catch (err) {
    next(err);
  }
};
