import { Router } from "express";
import {
  getMetaPixelSettings,
  updateMetaPixelSettings,
  testMetaPixelConnection,
  getPublicMetaPixelConfig,
  getGoogleAnalyticsSettings,
  updateGoogleAnalyticsSettings,
  getSeoSettings,
  updateSeoSettings,
} from "../controllers/SettingsController.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const settingsRouter = Router();

// Public sanitized Meta Pixel configuration for customer storefront
settingsRouter.get("/public/meta-pixel", getPublicMetaPixelConfig);

// Protected Meta Pixel and CAPI administration endpoints
settingsRouter.get(
  "/meta-pixel",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager"),
  getMetaPixelSettings
);

settingsRouter.put(
  "/meta-pixel",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager"),
  updateMetaPixelSettings
);

settingsRouter.post(
  "/meta-pixel/test",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager"),
  testMetaPixelConnection
);

// Protected Google Analytics administration endpoints
settingsRouter.get(
  "/google-analytics",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager"),
  getGoogleAnalyticsSettings
);

settingsRouter.put(
  "/google-analytics",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager"),
  updateGoogleAnalyticsSettings
);

// Protected SEO administration endpoints
settingsRouter.get(
  "/seo",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager"),
  getSeoSettings
);

settingsRouter.put(
  "/seo",
  authenticateToken,
  authorizeRoles("Owner", "Admin", "Manager"),
  updateSeoSettings
);

export default settingsRouter;
