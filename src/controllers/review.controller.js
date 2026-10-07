import ApiError from "../utils/ApiError.js";
import {
  createReviewService,
  getCourseReviewsService,
  deleteReviewService,
  updateReviewService,
} from "../services/review.service.js";

export const createReview = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const data = await createReviewService(
      courseId,
      req.body,
      req.user.id,
      req.user,
    );
    res.status(201).json({ success: true, message: "Review created", data });
  } catch (err) {
    next(err);
  }
};

export const getCourseReviews = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const result = await getCourseReviewsService(courseId, req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    await deleteReviewService(req.params.id, req.user);
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const data = await updateReviewService(req.params.id, req.body, req.user);
    res.json({ success: true, message: "Review updated", data });
  } catch (err) {
    next(err);
  }
};
