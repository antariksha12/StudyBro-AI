import { db } from "../config/firebaseAdmin.js";
import admin from "../config/firebaseAdmin.js";
import { PLAN_LIMITS, todayKey } from "../utils/planLimits.js";

/** POST /api/user/sync — creates the Firestore user doc on first login (idempotent) */
export async function syncUser(req, res, next) {
  try {
    const ref = db.collection("users").doc(req.user.uid);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        email: req.user.email || null,
        displayName: req.user.name || null,
        plan: "free",
        xp: 0,
        streak: 0,
        totalGenerations: 0,
        aiModel: "gemini-2.5-flash",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

/** GET /api/user/stats — dashboard/profile stats */
export async function getStats(req, res, next) {
  try {
    const userRef = db.collection("users").doc(req.user.uid);
    const [userSnap, usageSnap] = await Promise.all([
      userRef.get(),
      userRef.collection("usage").doc(todayKey()).get(),
    ]);

    const user = userSnap.exists ? userSnap.data() : {};
    const usage = usageSnap.exists ? usageSnap.data() : {};
    const plan = user.plan || "free";
    const xp = user.xp || 0;

    res.json({
      xp,
      level: Math.max(1, Math.floor(xp / 500) + 1),
      streak: user.streak || 0,
      totalGenerations: user.totalGenerations || 0,
      plan,
      requestsToday: usage.ai || 0,
      pdfUploadsToday: usage.pdf || 0,
      dailyLimit: plan === "premium" ? "∞" : PLAN_LIMITS.free.aiRequestsPerDay,
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/user/settings — update AI model preference, etc. */
export async function updateSettings(req, res, next) {
  try {
    const { aiModel } = req.body;
    const allowed = ["gemini-2.5-flash", "gemini-2.5-pro"];
    if (aiModel && !allowed.includes(aiModel)) {
      return res.status(400).json({ error: "Invalid AI model" });
    }

    await db.collection("users").doc(req.user.uid).set(
      { ...(aiModel && { aiModel }) },
      { merge: true }
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
