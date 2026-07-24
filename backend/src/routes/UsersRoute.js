import { Router } from "express";
import { createUser, deleteUser, getUserById, listUsers, updateUser } from "../controllers/UsersController.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const usersRouter = Router();

usersRouter.use(authenticateToken);

usersRouter.get("/", listUsers);
usersRouter.get("/:userId", getUserById);
usersRouter.post("/", createUser);
usersRouter.put("/:userId", updateUser);
usersRouter.delete("/:userId", deleteUser);

export default usersRouter;
