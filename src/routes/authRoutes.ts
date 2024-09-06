import express from "express";
import passport from "passport";
import {
  deleteSession,
  renewAccessToken,
  login,
  getRole,
  signUp,
  verify,
  loginAdmin,
  changePasswordVendor,
} from "../controllers/authController";
import requireUser from "../middleware/requireUser";

const router = express.Router();

router.route("/get-role").get(requireUser, getRole);
router.route("/logout").delete(deleteSession);
router.route("/renew").post(renewAccessToken);
router.route("/login").post(login);
router.route("/login-admin").post(loginAdmin);
router.route("/vendor-changePassword").post(requireUser, changePasswordVendor);
router.route("/verify/:token").get(verify);
router.route("/register").post(signUp);
export { router as authRoutes };
