import express from "express";
import path from "path";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./config/logger.js";
import productsRouter from "./routes/ProductsRoute.js";
import imagesRouter from "./routes/ImagesRoute.js";
import { searchProducts } from "./controllers/SearchController.js";
import emailRouter from "./routes/EmailRoute.js";
import ordersRouter from "./routes/OrdersRoute.js";
import usersRouter from "./routes/UsersRoute.js";
import authRouter from "./routes/AuthRoute.js";
import membersRouter from "./routes/MembersRoute.js";
import assetsRouter from "./routes/AssetsRoute.js";
import paymentsRouter from "./routes/PaymentsRoute.js";
import billingRouter from "./routes/BillingRoute.js";
// import exportRouter from "./routes/ExportRoute.js";
import categoriesRouter from "./routes/CategoryRoute.js";
import brandRouter from "./routes/BrandRoute.js";
import dashboardRouter from "./routes/DashboardRoute.js";

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

  app.use("/api/v1/products", productsRouter);
  app.use("/api/v1/images", imagesRouter);
  // app.use("/api/v1/export", exportRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/assets", assetsRouter);
  app.use("/api/v1/members", membersRouter);
  app.use("/api/v1/sendEmail", emailRouter);
  app.use("/api/v1/orders", ordersRouter);
  app.use("/api/v1/payments", paymentsRouter);
  app.use("/api/v1/billing", billingRouter);
  app.use("/api/v1/categories", categoriesRouter);
  app.use("/api/v1/brands", brandRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.get("/api/v1/search-products", searchProducts);

  app.use((req, res) => {
    res.status(404).json({ status: "error", message: "Resource not found" });
  });

  app.use(errorHandler);

  return app;
}
