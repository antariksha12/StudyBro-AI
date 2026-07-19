import { db } from "../config/firebaseAdmin.js";

/** GET /api/history?limit=20 */
export async function listHistory(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const snap = await db
      .collection("users")
      .doc(req.user.uid)
      .collection("history")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const items = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        mode: data.mode,
        content: data.content,
        preview: data.preview,
        createdAt: data.createdAt?.toDate?.().toISOString() || null,
      };
    });

    res.json({ items });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/history/:id */
export async function deleteHistoryItem(req, res, next) {
  try {
    await db.collection("users").doc(req.user.uid).collection("history").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
