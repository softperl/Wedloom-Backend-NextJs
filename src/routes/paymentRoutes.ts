import express from "express";
import requireUser from "../middleware/requireUser";
import { createPayment, submitPayment } from "../controllers/paymentController";

const router = express.Router();

router.route("/create").get(createPayment);
router.route("/submit").post(submitPayment);

export { router as paymentRoutes };
