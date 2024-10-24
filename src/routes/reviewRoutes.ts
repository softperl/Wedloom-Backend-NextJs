import express from "express";
import requireUser from "../middleware/requireUser";
import {
  createReview,
  getPublicReviews,
  getReviewDistribution,
  getReviews,
  getReviewsAdmin,
  reviewReply,
} from "../controllers/reviewController";

const router = express.Router();

router.route("/new").post(requireUser, createReview);
router.route("/reply").post(requireUser, reviewReply);
router.route("/get-all").get(requireUser, getReviews);
router.route("/get-all/:userId").get(requireUser, getReviewsAdmin);
router.route("/public/get-all/:vendorId").get(getPublicReviews);
router
  .route("/public/review-distribution/:vendorId")
  .get(getReviewDistribution);

export { router as reviewRoutes };
