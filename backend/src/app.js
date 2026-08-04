import express from "express";
import path from "path";
import cors from "cors";
import { errorHandler } from "./core/middlewares/errorHandler.js";
import { logger } from "./config/logger.js";
import coreRouter from "./core/routesIndex.js";

export async function createApp() {
  const app = express();

  app.set("wpTablePrefix", process.env.WP_TABLE_PREFIX || "wp_");
  const corsOptions = {
    origin: [
      "http://decantrebd.com",
      "https://decantrebd.com",
      "http://www.decantrebd.com",
      "https://www.decantrebd.com",
      "http://dashboard.decantrebd.com",
      "https://dashboard.decantrebd.com",
      "http://localhost:8001",
      "http://localhost:8005",
      "https://localhost:8005",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    credentials: false,
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
  app.options(/(.*)/, cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.use(
    "/src/uploads",
    express.static(path.join(process.cwd(), "src", "uploads")),
  );

  app.use((req, res, next) => {
    logger.info({ method: req.method, path: req.originalUrl }, "route hit");
    next();
  });

  app.get("/", (req, res) => {
    res.json({ "API is live": true });
  });

  app.use("/api/v1", coreRouter);
  // app.use("/api/client", clientRouter);

  app.use((req, res) => {
    res.status(404).json({ status: "error", message: "Resource not found" });
  });

  app.use(errorHandler);

  return app;
}
