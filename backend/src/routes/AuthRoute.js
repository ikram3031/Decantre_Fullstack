import { Router } from "express";
import { login, refreshToken, logout } from "../controllers/AuthController.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);

export default authRouter;
