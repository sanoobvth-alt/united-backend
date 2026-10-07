import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN } from "../constants/roles.js";
import createUploader from "../middlewares/upload.middleware.js";
import {
  getAllAbout,
  createAbout,
  getAboutById,
  updateAbout,
  deleteAboutById,
  getActiveAbout,
} from "../controllers/about.controller.js";
import {
  createAboutValidation,
  updateAboutValidation,
  aboutIdValidation,
} from "../validators/about.validator.js";

const router = express.Router();
const uploadImage = createUploader("about");

router.get("/", authenticate, authorize(ADMIN), getAllAbout);

router.post(
  "/",
  authenticate,
  authorize(ADMIN),
  uploadImage.single("image"),
  createAboutValidation(),
  createAbout,
);

router.get("/active-about", getActiveAbout);

router.get("/:id", aboutIdValidation(), getAboutById);

router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN),
  aboutIdValidation(),
  uploadImage.single("image"),
  updateAboutValidation(),
  updateAbout,
);

router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN),
  aboutIdValidation(),
  deleteAboutById,
);

export default router;
