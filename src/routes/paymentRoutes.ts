import express from "express";
import requireUser from "../middleware/requireUser";
import { createPayment } from "../controllers/paymentController";

const router = express.Router();

router.route("/new").post(requireUser, createPayment);

export { router as paymentRoutes };
