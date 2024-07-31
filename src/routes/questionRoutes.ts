import express from "express";
import {
  newQuestion,
  deleteQuestion,
  getAllQuestions,
} from "../controllers/questionController";
import requireUser from "../middleware/requireUser";
import hasRole from "../middleware/hasRole";

const router = express.Router();

router
  .route("/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newQuestion);

router
  .route("/delete/:questionId")
  .delete(requireUser, hasRole(["Admin", "Super"]), deleteQuestion);

router.route("/get-all").get(getAllQuestions);
export { router as questionRoutes };
