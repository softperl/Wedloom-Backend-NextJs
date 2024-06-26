import express from "express";
import {
  newTerms,
  newPrivacy,
  newRefund,
  deleteTerms,
  deletePrivacy,
  deleteRefund,
  getTerms,
  getPrivacy,
  getRefund,
} from "../controllers/siteController";
import requireUser from "../middleware/requireUser";
import hasRole from "../middleware/hasRole";

const router = express.Router();

router
  .route("/terms/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newTerms);
router
  .route("/privacy/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newPrivacy);
router
  .route("/refund/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newRefund);
router
  .route("/terms/delete")
  .delete(requireUser, hasRole(["Admin", "Super"]), deleteTerms);
router
  .route("/privacy/delete")
  .delete(requireUser, hasRole(["Admin", "Super"]), deletePrivacy);
router
  .route("/refund/delete")
  .delete(requireUser, hasRole(["Admin", "Super"]), deleteRefund);
router.route("/terms").get(getTerms);
router.route("/privacy").get(getPrivacy);
router.route("/refund").get(getRefund);

export { router as siteRoutes };
