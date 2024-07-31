import express from "express";
import {
  createConversation,
  getConversationsByUser,
  createMessage,
  getMessages,
  deleteConversation,
} from "../controllers/chatController";
import requireUser from "../middleware/requireUser";

const router = express.Router();

router.route("/create-conversation").post(requireUser, createConversation);
router.route("/get-conversations").get(requireUser, getConversationsByUser);
router.route("/create-message").post(requireUser, createMessage);
router.route("/get-messages/:conversationId").get(requireUser, getMessages);
router
  .route("/delete-conversation/:conversationId")
  .delete(requireUser, deleteConversation);
export { router as chatRoutes };
