import { Router } from "express";
import { createMember, getMemberById, listMembers, updateMember, deleteMember, registerMember, verifyMemberOtp, loginMember, resendMemberOtp, forgotPassword, resetPassword } from "../controllers/MembersController.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const membersRouter = Router();

membersRouter.post("/register", registerMember);
membersRouter.post("/login", loginMember);
membersRouter.post("/verify-otp", verifyMemberOtp);
membersRouter.post("/resend-otp", resendMemberOtp);
membersRouter.post("/forgot-password", forgotPassword);
membersRouter.post("/reset-password", resetPassword);

membersRouter.use(authenticateToken);
membersRouter.post("/", createMember);
membersRouter.get("/", listMembers);
membersRouter.get("/:memberId", getMemberById);
membersRouter.put("/:memberId", authorizeRoles("super_admin", "admin", "store_manager"), updateMember);
membersRouter.delete("/:memberId", authorizeRoles("super_admin", "admin", "store_manager"), deleteMember);

export default membersRouter;
