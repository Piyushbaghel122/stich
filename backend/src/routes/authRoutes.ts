import { Router } from "express";
import registerController, {
  forgotPassword,
  resetPassword,
  loginController,
  logoutController,
  getMeController,
  sendOtpController,
  verifyOtpController,
} from "../controller/authController.js";
import { requireUser } from "../middleware/authMiddleware.js";

const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.post("/logout", logoutController);
authRoutes.get("/getMe", requireUser, getMeController);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password/:token", resetPassword);

authRoutes.post("/phone", sendOtpController);
authRoutes.post("/otp", sendOtpController);
authRoutes.post("/verify-otp", verifyOtpController);
authRoutes.post("/resend-otp", sendOtpController);

export default authRoutes;
