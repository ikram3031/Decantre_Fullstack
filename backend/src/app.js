import express from "express";
import path from "path";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./config/logger.js";
import productsRouter from "./routes/ProductsRoute.js";
import { searchProducts } from "./controllers/SearchController.js";
import emailRouter from "./routes/EmailRoute.js";
import ordersRouter from "./routes/OrdersRoute.js";
import usersRouter from "./routes/UsersRoute.js";
import authRouter from "./routes/AuthRoute.js";
// import exportRouter from "./routes/ExportRoute.js";
import categoriesRouter from "./routes/CategoryRoute.js";
import brandRouter from "./routes/BrandRoute.js";

export async function createApp() {
  const app = express();

  app.set("wpTablePrefix", process.env.WP_TABLE_PREFIX || "wp_");

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow all origins — no credentials conflict since we removed credentials:true
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.use((req, res, next) => {
    logger.info({ method: req.method, path: req.originalUrl }, "route hit");
    next();
  });

  app.get("/", (req, res) => {
    res.json({ "API is live": true });
  });

  app.use("/api/v1/products", productsRouter);
  // app.use("/api/v1/images", imagesRouter);
  // app.use("/api/v1/export", exportRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/sendEmail", emailRouter);
  app.use("/api/v1/orders", ordersRouter);
  app.use("/api/v1/categories", categoriesRouter);
  app.use("/api/v1/brands", brandRouter);
  app.get("/api/v1/search-products", searchProducts);

  app.use((req, res) => {
    res.status(404).json({ status: "error", message: "Resource not found" });
  });

  app.use(errorHandler);

  return app;
}
