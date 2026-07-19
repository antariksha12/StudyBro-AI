import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  listConversations,
  getConversationMessages,
  renameConversation,
  starConversation,
  deleteConversation,
} from "../controllers/conversationController.js";

const router = Router();

router.get("/", requireAuth, listConversations);
router.get("/:id/messages", requireAuth, getConversationMessages);
router.patch("/:id", requireAuth, renameConversation);
router.patch("/:id/star", requireAuth, starConversation);
router.delete("/:id", requireAuth, deleteConversation);

export default router;
