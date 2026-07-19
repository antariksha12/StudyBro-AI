import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { syncUser, getStats, updateSettings } from "../controllers/userController.js";

const router = Router();

router.post("/sync", requireAuth, syncUser);
router.get("/stats", requireAuth, getStats);
router.post("/settings", requireAuth, updateSettings);

export default router;
