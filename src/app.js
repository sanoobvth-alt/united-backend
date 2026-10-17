import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import apiRoutes from "./routes/index.js";
import { openapiSpec } from "./openapi.js";
import { notFound } from "./middlewares/not-found.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
app.disable("x-powered-by");
const corsOptions = {
  origin:
    process.env.NODE_ENV === "development" ? true : "https://yourdomain.com",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.get("/health", (_req, res) =>
  res.json({ success: true, data: { status: "ok" } }),
);
// app.get("/api-docs/openapi.json", (_req, res) => res.json(openapiSpec));
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
    },
  }),
);
app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
