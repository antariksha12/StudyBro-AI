import { db } from "../config/firebaseAdmin.js";
import { PLAN_LIMITS, todayKey } from "../utils/planLimits.js";

/**
 * Enforces the free-plan daily quota for a given usage type ("ai" or "pdf").
 * Premium users bypass the check entirely. Counts are stored per-user, per-day
 * in Firestore at users/{uid}/usage/{YYYY-MM-DD} so they reset automatically.
 */
export function checkDailyLimit(kind) {
  return async (req, res, next) => {
    try {
      const uid = req.user.uid;
      const userSnap = await db.collection("users").doc(uid).get();
      const plan = userSnap.exists ? userSnap.data().plan || "free" : "free";

      if (plan === "premium") {
        req.usage = { plan, unlimited: true };
        return next();
      }

      const limits = PLAN_LIMITS.free;
      const limit = kind === "pdf" ? limits.pdfUploadsPerDay : limits.aiRequestsPerDay;

      const usageRef = db.collection("users").doc(uid).collection("usage").doc(todayKey());
      const usageSnap = await usageRef.get();
      const current = usageSnap.exists ? usageSnap.data()[kind] || 0 : 0;

      if (current >= limit) {
        return res.status(429).json({
          error: `Daily ${kind === "pdf" ? "PDF upload" : "AI request"} limit reached (${limit}/day on the Free plan). Upgrade to Premium for unlimited access.`,
        });
      }

      req.usage = { plan, current, limit, usageRef, kind };
      next();
    } catch (err) {
      console.error("Rate limit check failed:", err.message);
      res.status(500).json({ error: "Could not verify usage limits" });
    }
  };
}
