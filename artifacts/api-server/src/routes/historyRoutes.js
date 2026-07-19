import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { listHistory, deleteHistoryItem } from "../controllers/historyController.js";

const router = Router();

router.get("/", requireAuth, listHistory);
router.delete("/:id", requireAuth, deleteHistoryItem);

export default router;
