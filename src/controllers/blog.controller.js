import ApiError from "../utils/ApiError.js";
import {
  getAllBlogsService,
  createBlogService,
  getBlogByIdService,
  updateBlogService,
  deleteBlogService,
  getAllTagsService,
} from "../services/blog.service.js";
import { blogSerializer } from "../serializers/blog.serializer.js";

export const getAllBlogs = async (req, res, next) => {
  try {
    const result = await getAllBlogsService(req.query);
    result.data = result.data.map(blogSerializer);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const imagePath = req.fileUrl || undefined;
    const data = await createBlogService(req.body, req.user.id, imagePath);
    const serialized = blogSerializer(data);
    res
      .status(201)
      .json({ success: true, message: "Blog created", data: serialized });
  } catch (err) {
    next(err);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const data = await getBlogByIdService(req.params.id);
    const serialized = blogSerializer(data);
    res.json({ success: true, data: serialized });
  } catch (err) {
    next(err);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const imagePath = req.fileUrl || undefined;
    const data = await updateBlogService(
      req.params.id,
      req.body,
      req.user.id,
      imagePath,
    );
    const serialized = blogSerializer(data);
    res.json({ success: true, message: "Blog updated", data: serialized });
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    await deleteBlogService(req.params.id, req.user.id);
    res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    next(err);
  }
};

export const getAllTags = async (req, res, next) => {
  try {
    const result = await getAllTagsService();
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
