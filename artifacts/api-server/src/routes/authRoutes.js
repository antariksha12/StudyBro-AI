import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

/**
 * GET /api/auth/me
 * Email/password login, Google Sign-In, and password reset are handled
 * client-side by the Firebase Auth SDK (see frontend/src/context/AuthContext.jsx) —
 * that's the recommended flow, since Firebase issues the session token directly
 * to the browser. This endpoint just lets the frontend confirm a token is valid
 * and read back the identity the backend sees, useful for debugging integrations.
 */
router.get("/me", requireAuth, (req, res) => {
  res.json({ uid: req.user.uid, email: req.user.email, name: req.user.name || null });
});

export default router;
