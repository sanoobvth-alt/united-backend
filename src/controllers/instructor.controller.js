import ApiError from "../utils/ApiError.js";
import {
  getAllInstructorsService,
  getInstructorByIdService,
  updateInstructorService,
  deleteInstructorService,
  activateInstructorService,
  resetInstructorPasswordService,
  createInstructorWithUser,
} from "../services/instructor.service.js";
import { instructorSerializer } from "../serializers/instructor.serializer.js";
import { userSerializer } from "../serializers/auth.serializer.js";

export const getAllInstructors = async (req, res, next) => {
  try {
    const result = await getAllInstructorsService(req.query);
    result.data = result.data.map(instructorSerializer);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getInstructorById = async (req, res, next) => {
  try {
    const data = await getInstructorByIdService(req.params.id);
    res.json({ success: true, data: instructorSerializer(data) });
  } catch (err) {
    next(err);
  }
};

export const createInstructor = async (req, res, next) => {
  try {
    const imagePath = req.fileUrl || undefined;
    const data = await createInstructorWithUser(req.body, req.user, imagePath);
    res.status(201).json({
      success: true,
      message: "Instructor created",
      data: userSerializer(data),
    });
  } catch (err) {
    next(err);
  }
};

export const updateInstructor = async (req, res, next) => {
  try {
    const data = await updateInstructorService(
      req.params.id,
      req.body,
      req.user.id,
      req.fileUrl,
    );

    res.json({
      success: true,
      message: "Instructor updated",
      data: instructorSerializer(data),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteInstructor = async (req, res, next) => {
  try {
    await deleteInstructorService(req.params.id, req.user.id);
    res.json({
      success: true,
      message: "Instructor deleted",
    });
  } catch (err) {
    next(err);
  }
};

export const activateInstructor = async (req, res, next) => {
  try {
    await activateInstructorService(req.params.id, req.user.id);
    res.json({
      success: true,
      message: "Instructor activated successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const resetInstructorPassword = async (req, res, next) => {
  try {
    await resetInstructorPasswordService(
      req.params.id,
      req.body?.password,
      req.user.id,
    );

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    next(err);
  }
};
