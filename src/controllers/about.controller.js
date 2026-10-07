import ApiError from "../utils/ApiError.js";
import {
  getAllAboutService,
  createAboutService,
  getAboutByIdService,
  updateAboutService,
  deleteAboutByIdService,
  getActiveAboutService,
} from "../services/about.service.js";
import { aboutSerializer } from "../serializers/about.serializer.js";

export const getAllAbout = async (req, res, next) => {
  try {
    const result = await getAllAboutService(req.query);
    const serialized = result.data.map(aboutSerializer);
    res.json({
      success: true,
      data: serialized,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
};

export const createAbout = async (req, res, next) => {
  try {
    const data = await createAboutService(req.body, req.fileUrl, req.user.id);
    const serialized = aboutSerializer(data);
    res.status(201).json({
      success: true,
      message: "About created successfully",
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const getAboutById = async (req, res, next) => {
  try {
    const data = await getAboutByIdService(req.params.id);
    const serialized = aboutSerializer(data);
    res.json({ success: true, data: serialized });
  } catch (err) {
    next(err);
  }
};

export const getActiveAbout = async (req, res, next) => {
  try {
    const data = await getActiveAboutService();
    const serialized = aboutSerializer(data);
    res.json({ success: true, data: serialized });
  } catch (err) {
    next(err);
  }
};

export const updateAbout = async (req, res, next) => {
  try {
    const data = await updateAboutService(
      req.params.id,
      req.body,
      req.fileUrl,
      req.user.id,
    );
    const serialized = aboutSerializer(data);
    res.json({
      success: true,
      message: "About updated successfully",
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAboutById = async (req, res, next) => {
  try {
    await deleteAboutByIdService(req.params.id);
    res.json({ success: true, message: "About deleted successfully" });
  } catch (err) {
    next(err);
  }
};
