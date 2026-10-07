import prisma from "../config/prisma.js";
import { userSerializer } from "../serializers/auth.serializer.js";
import { studentSerializer } from "../serializers/student.serializer.js";
import {
  updateStudentService,
  createStudentWithUser,
  getAllStudentsService,
  getStudentByIdService,
  deleteStudentService,
  activateStudentService,
  resetStudentPasswordService,
  enrollStudentService,
} from "../services/student.service.js";
import ApiError from "../utils/ApiError.js";

export const getAllStudents = async (req, res, next) => {
  try {
    const result = await getAllStudentsService(req.query);
    result.data = result.data.map(studentSerializer);
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const student = await getStudentByIdService(req.params.id, req.user);
    res.json({ success: true, data: studentSerializer(student) });
  } catch (err) {
    next(err);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const imagePath = req.fileUrl || undefined;
    const user = req.user;
    const data = await createStudentWithUser({
      ...req.body,
      image: imagePath,
      user: user,
    });
    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: userSerializer(data),
    });
  } catch (err) {
    next(err);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const updatedStudent = await updateStudentService(
      req?.params?.id,
      req.body,
      req.user,
      req.fileUrl,
    );

    res.json({
      success: true,
      message: "Student updated successfully",
      data: studentSerializer(updatedStudent),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    await deleteStudentService(req.params.id, req.user);
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const activateStudent = async (req, res, next) => {
  try {
    await activateStudentService(req.params.id, req.user);
    res.json({
      success: true,
      message: "Student activated successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const resetStudentPassword = async (req, res, next) => {
  try {
    await resetStudentPasswordService(
      req.params.id,
      req.body?.password,
      req.user,
    );

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const enrollStudent = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const enrollment = await enrollStudentService(
      req.params.id,
      courseId,
      req.user,
    );

    res.status(201).json({
      success: true,
      message: "Student enrolled successfully",
      data: enrollment,
    });
  } catch (err) {
    next(err);
  }
};
