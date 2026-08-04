import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ status: "error", message: "Authorization header missing" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ status: "error", message: "Invalid authorization format" });
  }

  try {
    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ status: "error", message: "Invalid or expired access token" });
  }
};

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Authentication required" });
  }

  const currentRole = typeof req.user.role === "string" ? req.user.role.toLowerCase() : "";
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

  if (!normalizedAllowedRoles.includes(currentRole)) {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }

  return next();
};
