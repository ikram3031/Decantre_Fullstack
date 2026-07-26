import { Router } from "express";
import { createSuperAdmin, login, refreshToken, logout, register, verifyOtp } from "../controllers/AuthController.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);
authRouter.post("/create-super-admin", createSuperAdmin);

export default authRouter;
