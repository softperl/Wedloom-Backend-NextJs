import express from "express";
import {
  newEvent,
  getAllEventsByUserId,
  deleteEvent,
} from "../controllers/eventController";
import requireUser from "../middleware/requireUser";
import hasRole from "../middleware/hasRole";

const router = express.Router();

router.route("/new").post(requireUser, newEvent);
router.route("/get-events").get(requireUser, getAllEventsByUserId);
router
  .route("/delete/:eventId")
  .delete(requireUser, hasRole(["Admin", "Super"]), deleteEvent);

export { router as eventRoutes };
