import { Router } from "express";
import { createSuperAdmin, login, refreshToken, logout } from "../controllers/AuthController.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);
authRouter.post("/create-super-admin", createSuperAdmin);

export default authRouter;
