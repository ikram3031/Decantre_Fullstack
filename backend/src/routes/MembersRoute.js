import { Router } from "express";
import { createMember, getMemberById, listMembers, updateMember, deleteMember, registerMember, verifyMemberOtp, loginMember, resendMemberOtp } from "../controllers/MembersController.js";

const membersRouter = Router();

membersRouter.post("/register", registerMember);
membersRouter.post("/login", loginMember);
membersRouter.post("/verify-otp", verifyMemberOtp);
membersRouter.post("/resend-otp", resendMemberOtp);
membersRouter.post("/", createMember);
membersRouter.get("/", listMembers);
membersRouter.get("/:memberId", getMemberById);
membersRouter.put("/:memberId", updateMember);
membersRouter.delete("/:memberId", deleteMember);

export default membersRouter;
