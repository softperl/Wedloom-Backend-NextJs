import express from "express";
import {
  newPost,
  deletePost,
  getAllPosts,
  newCategory,
  getAllCategories,
  deleteCategory,
} from "../controllers/postController";
import requireUser from "../middleware/requireUser";
import hasRole from "../middleware/hasRole";

const router = express.Router();

router
  .route("/post/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newPost);
router.route("/post/get-all").get(getAllPosts);
router
  .route("/category/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newCategory);
router.route("/category/get-all").get(getAllCategories);
router
  .route("/post/delete/:postId")
  .delete(requireUser, hasRole(["Admin", "Super"]), deletePost);
router
  .route("/category/delete/:categoryId")
  .delete(requireUser, hasRole(["Admin", "Super"]), deleteCategory);

export { router as blogRoutes };
