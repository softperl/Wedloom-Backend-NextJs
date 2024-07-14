import express from "express";
import {
  newContact,
  changeStatus,
  deleteContact,
  getContacts,
} from "../controllers/contactController";
import requireUser from "../middleware/requireUser";
import hasRole from "../middleware/hasRole";

const router = express.Router();

router.route("/new").post(requireUser, newContact);
router
  .route("/get-all")
  .get(requireUser, hasRole(["Admin", "Super"]), getContacts);
router
  .route("/change-status")
  .put(requireUser, hasRole(["Admin", "Super"]), changeStatus);
router
  .route("/delete/:contactId")
  .delete(requireUser, hasRole(["Admin", "Super"]), deleteContact);

export { router as contactRoutes };
