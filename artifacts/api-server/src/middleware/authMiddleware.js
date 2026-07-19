import { auth } from "../config/firebaseAdmin.js";

/**
 * Verifies the Firebase ID token sent in the Authorization header
 * (format: "Bearer <token>") and attaches the decoded user to req.user.
 * Every protected route uses this so the backend never trusts a client-sent uid.
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing authentication token" });
    }

    const decoded = await auth.verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
    next();
  } catch (err) {
    console.error("Auth verification failed:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
