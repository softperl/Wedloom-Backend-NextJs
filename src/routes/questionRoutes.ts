import express from "express";
import {
  newQuestion,
  deleteQuestion,
  getAllQuestions,
  editQuestion,
  getQuestionById,
} from "../controllers/questionController";
import requireUser from "../middleware/requireUser";
import hasRole from "../middleware/hasRole";

const router = express.Router();

router
  .route("/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newQuestion);

router
  .route("/edit/:questionId")
  .get(requireUser, hasRole(["Admin", "Super"]), editQuestion);

router
  .route("/:questionId")
  .post(requireUser, hasRole(["Admin", "Super"]), getQuestionById);

router
  .route("/delete/:questionId")
  .delete(requireUser, hasRole(["Admin", "Super"]), deleteQuestion);

router.route("/get-all").get(getAllQuestions);
export { router as questionRoutes };
