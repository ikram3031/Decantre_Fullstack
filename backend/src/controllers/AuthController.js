import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";
import { env } from "../config/env.js";
import { comparePassword, hashPassword } from "../utils/password.js";

function createAccessToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN },
  );
}

function createRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
    if (!user || !user.passwordHash) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    const refreshToken = createRefreshToken();
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_MS);
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
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req, res, next) {
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
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_MS);
    await user.save();

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      env.ACCESS_TOKEN_SECRET,
      { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN },
    );

    res.json({ status: "success", data: { accessToken, refreshToken: newRefreshToken } });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
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
}
