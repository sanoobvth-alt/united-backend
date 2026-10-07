import ApiError from "../utils/ApiError.js";
import {
  getAllTestimonialsService,
  createTestimonialService,
  getTestimonialByIdService,
  updateTestimonialService,
  deleteTestimonialService,
} from "../services/testimonial.service.js";
import { testimonialSerializer } from "../serializers/testimonial.serializer.js";

export const getAllTestimonials = async (req, res, next) => {
  try {
    const result = await getAllTestimonialsService(req.query);
    result.data = result.data.map(testimonialSerializer);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const createTestimonial = async (req, res, next) => {
  try {
    const data = await createTestimonialService(
      req.body,
      req.user.id,
      req.user,
    );
    const serialized = testimonialSerializer(data);
    res
      .status(201)
      .json({
        success: true,
        message: "Testimonial created",
        data: serialized,
      });
  } catch (err) {
    next(err);
  }
};

export const getTestimonialById = async (req, res, next) => {
  try {
    const data = await getTestimonialByIdService(req.params.id);
    const serialized = testimonialSerializer(data);
    res.json({ success: true, data: serialized });
  } catch (err) {
    next(err);
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const data = await updateTestimonialService(
      req.params.id,
      req.body,
      req.user,
    );
    const serialized = testimonialSerializer(data);
    res.json({
      success: true,
      message: "Testimonial updated",
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    await deleteTestimonialService(req.params.id, req.user);
    res.json({ success: true, message: "Testimonial deleted" });
  } catch (err) {
    next(err);
  }
};
