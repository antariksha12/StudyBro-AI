import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authMiddleware.js";
import { checkDailyLimit } from "../middleware/rateLimiter.js";
import { db } from "../config/firebaseAdmin.js";
import { generateFromTextHandler, generateFromFileHandler, chatHandler } from "../controllers/aiController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

const ALLOWED_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

// Attaches the user's preferred Groq model (set in Settings) to the request.
// Any model not in ALLOWED_MODELS (e.g. a stale Gemini name in Firestore)
// is silently clamped to DEFAULT_MODEL so unavailable models can never be used.
async function attachAiModel(req, res, next) {
  try {
    const snap = await db.collection("users").doc(req.user.uid).get();
    const stored = snap.exists ? snap.data().aiModel : null;
    req.aiModel = ALLOWED_MODELS.includes(stored) ? stored : DEFAULT_MODEL;
    next();
  } catch (err) {
    next(err);
  }
}

router.post("/generate", requireAuth, checkDailyLimit("ai"), attachAiModel, generateFromTextHandler);

router.post("/chat", requireAuth, upload.single("file"), checkDailyLimit("ai"), attachAiModel, chatHandler);

router.post(
  "/generate-file",
  requireAuth,
  upload.single("file"),
  (req, res, next) => checkDailyLimit(req.body.inputType === "pdf" ? "pdf" : "ai")(req, res, next),
  attachAiModel,
  generateFromFileHandler
);

export default router;
