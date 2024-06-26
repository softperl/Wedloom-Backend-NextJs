import express from "express";
import passport from "passport";
import { getAllUsers } from "../controllers/adminAuthController";
import requireUser from "../middleware/requireUser";

const router = express.Router();

router.route("/get-all-users").get(requireUser, getAllUsers);
export { router as adminAuthRoutes };
