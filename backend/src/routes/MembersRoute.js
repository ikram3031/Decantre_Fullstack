import { Router } from "express";
import { createMember, getMemberById, listMembers, updateMember, deleteMember } from "../controllers/MembersController.js";

const membersRouter = Router();

membersRouter.post("/", createMember);
membersRouter.get("/", listMembers);
membersRouter.get("/:memberId", getMemberById);
membersRouter.put("/:memberId", updateMember);
membersRouter.delete("/:memberId", deleteMember);

export default membersRouter;
