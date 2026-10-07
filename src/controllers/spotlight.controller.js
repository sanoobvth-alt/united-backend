import ApiError from "../utils/ApiError.js";
import {
  getAllSpotlightsService,
  createSpotlightService,
  getSpotlightByIdService,
  updateSpotlightService,
  deleteSpotlightByIdService,
} from "../services/spotlight.service.js";
import { spotlightSerializer } from "../serializers/spotlight.serializer.js";

export const getAllSpotlights = async (req, res, next) => {
  try {
    const result = await getAllSpotlightsService(req.query);
    const serialized = result.data.map(spotlightSerializer);
    res.json({
      success: true,
      data: serialized,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
};

export const createSpotlight = async (req, res, next) => {
  try {
    const data = await createSpotlightService(
      req.body,
      req.fileUrl,
      req.user.id,
    );
    const serialized = spotlightSerializer(data);
    res.status(201).json({
      success: true,
      message: "Spotlight created successfully",
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const getSpotlightById = async (req, res, next) => {
  try {
    const data = await getSpotlightByIdService(req.params.id);
    const serialized = spotlightSerializer(data);
    res.json({ success: true, data: serialized });
  } catch (err) {
    next(err);
  }
};

export const updateSpotlight = async (req, res, next) => {
  try {
    const data = await updateSpotlightService(
      req.params.id,
      req.body,
      req.fileUrl,
      req.user.id,
    );
    const serialized = spotlightSerializer(data);
    res.json({
      success: true,
      message: "Spotlight updated successfully",
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSpotlightById = async (req, res, next) => {
  try {
    await deleteSpotlightByIdService(req.params.id);
    res.json({ success: true, message: "Spotlight deleted successfully" });
  } catch (err) {
    next(err);
  }
};
