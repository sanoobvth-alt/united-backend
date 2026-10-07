import { userSerializer } from "../serializers/auth.serializer.js";
import {
  loginUser,
  createStudent,
  createInstructor,
} from "../services/auth.service.js";

export const login = async (req, res, next) => {
  try {
    const data = await loginUser(req.body.email, req.body.password);
    const formatted = userSerializer(data.user);
    res.json({
      success: true,
      message: "Login successfully",
      data: { user: formatted, token: data.token },
    });
  } catch (err) {
    next(err);
  }
};

export const signUpStudent = async (req, res, next) => {
  try {
    const imagePath = req.fileUrl || undefined;
    const user = req.user;
    const data = await createStudent({
      ...req.body,
      image: imagePath,
      user: user,
    });
    const formatted = userSerializer(data);
    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};

export const signUpInstructor = async (req, res, next) => {
  try {
    const imagePath = req.fileUrl || undefined;
    const user = req.user;
    const data = await createInstructor({
      ...req.body,
      image: imagePath,
      user: user,
    });
    const formatted = userSerializer(data);
    res.status(201).json({
      success: true,
      message: "Instructor created successfully",
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};
