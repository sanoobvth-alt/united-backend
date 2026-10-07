import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN } from "../constants/roles.js";
import {
  getAllSpotlights,
  createSpotlight,
  getSpotlightById,
  updateSpotlight,
  deleteSpotlightById,
} from "../controllers/spotlight.controller.js";
import {
  createSpotlightValidation,
  updateSpotlightValidation,
  spotlightIdValidation,
} from "../validators/spotlight.validator.js";
import createUploader from "../middlewares/upload.middleware.js";

const router = express.Router();
const uploadImage = createUploader("spotlights");

router.get("/", getAllSpotlights);

router.post(
  "/",
  authenticate,
  authorize(ADMIN),
  uploadImage.single("image"),
  createSpotlightValidation(),
  createSpotlight,
);

router.get("/:id", spotlightIdValidation(), getSpotlightById);

router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN),
  uploadImage.single("image"),
  spotlightIdValidation(),
  updateSpotlightValidation(),
  updateSpotlight,
);

router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN),
  spotlightIdValidation(),
  deleteSpotlightById,
);

export default router;
