import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";
import { env } from "../config/env.js";
import { comparePassword, hashPassword } from "../utils/password.js";

const createAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN },
  );
};

const createRefreshToken = () => {
  return crypto.randomBytes(48).toString("hex");
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";

    if (!normalizedEmail || !password) {
      return res.status(400).json({ status: "error", message: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email: normalizedEmail }).select("+passwordHash");
    if (!user || !user.passwordHash) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    const refreshToken = createRefreshToken();
    const refreshTokenExpiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_MS);
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;
    await user.save();

    const accessToken = createAccessToken(user);

    res.json({
      status: "success",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        accessTokenExpiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
        refreshToken,
        refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) {
      return res.status(400).json({ status: "error", message: "refreshToken is required" });
    }

    const user = await UserModel.findOne({ refreshToken }).select("+refreshToken +refreshTokenExpiresAt");
    if (!user || !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
      return res.status(401).json({ status: "error", message: "Invalid or expired refresh token" });
    }

    const newRefreshToken = createRefreshToken();
    const refreshTokenExpiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_MS);
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;
    await user.save();

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      env.ACCESS_TOKEN_SECRET,
      { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN },
    );

    res.json({
      status: "success",
      data: {
        accessToken,
        accessTokenExpiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) {
      return res.status(400).json({ status: "error", message: "refreshToken is required" });
    }

    const user = await UserModel.findOne({ refreshToken }).select("+refreshToken +refreshTokenExpiresAt");
    if (user) {
      user.refreshToken = undefined;
      user.refreshTokenExpiresAt = undefined;
      await user.save();
    }

    res.json({ status: "success", message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const createSuperAdmin = async (req, res, next) => {
  try {
    if (!env.ALLOW_SUPER_ADMIN_CREATION) {
      return res.status(403).json({ status: "error", message: "Super admin creation is disabled" });
    }

    const { name, email, password } = req.body ?? {};
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
    const trimmedPassword = typeof password === "string" ? password : "";

    const errors = [];
    if (!trimmedName) {
      errors.push("name is required");
    }
    if (!trimmedEmail) {
      errors.push("email is required");
    }
    if (!trimmedPassword || trimmedPassword.length < 6) {
      errors.push("password is required and must be at least 6 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ status: "error", message: "Invalid payload", errors });
    }

    let user = await UserModel.findOne({ email: trimmedEmail });
    if (user) {
      user.name = trimmedName;
      user.role = "Super_Admin";
      user.passwordHash = await hashPassword(trimmedPassword);
      user.isActive = true;
      await user.save();
      return res.status(200).json({ status: "success", message: "Super admin updated", data: { id: user.id, email: user.email, role: user.role } });
    }

    user = await UserModel.create({
      name: trimmedName,
      email: trimmedEmail,
      passwordHash: await hashPassword(trimmedPassword),
      role: "Super_Admin",
      isActive: true,
    });

    res.status(201).json({ status: "success", message: "Super admin created", data: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};
