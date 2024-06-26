import express from "express";
import { uploadFile } from "../controllers/uploadController";
import requireUser from "../middleware/requireUser";

const router = express.Router();

router.route("/upload").post(requireUser, uploadFile);

export { router as uploadRoutes };
