import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import apiRoutes from "./routes/index.js";
// import { openapiSpec } from "./openapi.js";
import { notFound } from "./middlewares/not-found.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

morgan.token("date", () => {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
});

const app = express();
app.disable("x-powered-by");
const corsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? true
      : "https://united-insurance-front-end.vercel.app",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
morgan.token("timestamp", () =>
  new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  }),
);

app.use(morgan(":timestamp | :method :url | :status | :response-time ms"));
app.get("/health", (_req, res) =>
  res.json({ success: true, data: { status: "ok" } }),
);
// app.get("/api-docs/openapi.json", (_req, res) => res.json(openapiSpec));
// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(openapiSpec, {
//     explorer: true,
//     swaggerOptions: {
//       persistAuthorization: true,
//       tryItOutEnabled: true,
//     },
//   }),
// );
app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
