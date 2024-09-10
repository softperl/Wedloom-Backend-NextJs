import express from "express";
import requireUser from "../middleware/requireUser";
import {
  createReview,
  getPublicReviews,
  getReviews,
  reviewReply,
} from "../controllers/reviewController";

const router = express.Router();

router.route("/new").post(requireUser, createReview);
router.route("/reply").post(requireUser, reviewReply);
router.route("/get-all").get(requireUser, getReviews);
router.route("/public/get-all/:vendorId").get(getPublicReviews);

export { router as reviewRoutes };
