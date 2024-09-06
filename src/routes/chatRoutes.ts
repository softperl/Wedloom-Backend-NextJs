import express from "express";
import {
  addToFav,
  createConversation,
  createMessage,
  deleteConversation,
  getChatUsersByConversationId,
  getConversationsByUser,
  getMessages,
  getUnreadConversation,
  isFavoriteConversation,
  markAsUnread,
  removeFromFav,
} from "../controllers/chatController";
import requireUser from "../middleware/requireUser";

const router = express.Router();

router
  .route("/create-conversation/:receiverId")
  .post(requireUser, createConversation);
router.route("/get-conversations").get(requireUser, getConversationsByUser);
router.route("/create-message").post(requireUser, createMessage);
router.route("/get-messages/:conversationId").get(requireUser, getMessages);
router
  .route("/delete-conversation/:conversationId")
  .delete(requireUser, deleteConversation);
router.route("/add-to-fav/:conversationId").post(requireUser, addToFav);
router
  .route("/remove-from-fav/:conversationId")
  .delete(requireUser, removeFromFav);
router
  .route("/get-chat-user/:conversationId")
  .get(requireUser, getChatUsersByConversationId);
router
  .route("/favorite-conversation/:conversationId")
  .get(requireUser, isFavoriteConversation);
router
  .route("/get-unread-conversation-count")
  .get(requireUser, getUnreadConversation);
router.route("/mark-as-unread").get(requireUser, markAsUnread);

export { router as chatRoutes };
