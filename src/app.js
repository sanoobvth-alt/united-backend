import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/students.routes.js";
import instructorRoutes from "./routes/instructors.routes.js";
import courseRoutes from "./routes/courses.routes.js";
import curriculumRoutes from "./routes/curriculum.routes.js";
import overviewRoutes from "./routes/overview.routes.js";
import courseCategoryRoutes from "./routes/course-categories.routes.js";
import blogCategoryRoutes from "./routes/blog-categories.routes.js";
import blogRoutes from "./routes/blogs.routes.js";
import testimonialRoutes from "./routes/testimonials.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import spotlightRoutes from "./routes/spotlights.routes.js";
import aboutRoutes from "./routes/about.routes.js";
// import jiraRoutes from "./module/jira/route/jira.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import notFoundMiddleware from "./middlewares/not-found.middleware.js";
import { optionalAuth } from "./middlewares/auth.middleware.js";

const app = express();
dotenv.config();

// Middleware setup
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  "/uploads",
  express.static("public/uploads", {
    fallthrough: false,
  }),
);
app.use(optionalAuth);
// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Edulink Dashboard",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/spotlights", spotlightRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/course-categories", courseCategoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/curriculum", curriculumRoutes);
app.use("/api/overview", overviewRoutes);
app.use("/api/blog-categories", blogCategoryRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/reviews", reviewRoutes);
// app.use("/api/jira", jiraRoutes);

// 404 handler
app.use(notFoundMiddleware);
// Error middleware (must be last)
app.use(errorMiddleware);

export default app;
