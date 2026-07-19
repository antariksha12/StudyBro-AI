import { db } from "../config/firebaseAdmin.js";
import admin from "../config/firebaseAdmin.js";

/** GET /api/conversations — list all conversations for the authenticated user */
export async function listConversations(req, res, next) {
  try {
    const snap = await db
      .collection("users")
      .doc(req.user.uid)
      .collection("conversations")
      .orderBy("updatedAt", "desc")
      .limit(200)
      .get();

    const conversations = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title || "Untitled chat",
        preview: d.preview || "",
        messageCount: d.messageCount || 0,
        starred: !!d.starred,
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    res.json(conversations);
  } catch (err) {
    next(err);
  }
}

/** GET /api/conversations/:id/messages — get all messages in a conversation */
export async function getConversationMessages(req, res, next) {
  try {
    const uid = req.user.uid;
    const convRef = db
      .collection("users")
      .doc(uid)
      .collection("conversations")
      .doc(req.params.id);

    const convSnap = await convRef.get();
    if (!convSnap.exists) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messagesSnap = await convRef
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        role: d.role,
        content: d.content,
        file: d.file || null,
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    const d = convSnap.data();
    res.json({
      conversation: {
        id: req.params.id,
        title: d.title || "Untitled chat",
        starred: !!d.starred,
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
      },
      messages,
    });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/conversations/:id — rename a conversation */
export async function renameConversation(req, res, next) {
  try {
    const title = req.body.title?.trim();
    if (!title) return res.status(400).json({ error: "title is required" });

    const ref = db
      .collection("users")
      .doc(req.user.uid)
      .collection("conversations")
      .doc(req.params.id);

    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Conversation not found" });

    await ref.update({ title });
    res.json({ id: req.params.id, title });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/conversations/:id/star — star or unstar a conversation */
export async function starConversation(req, res, next) {
  try {
    const starred = !!req.body.starred;

    const ref = db
      .collection("users")
      .doc(req.user.uid)
      .collection("conversations")
      .doc(req.params.id);

    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Conversation not found" });

    await ref.update({ starred });
    res.json({ id: req.params.id, starred });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/conversations/:id — delete a conversation and all its messages */
export async function deleteConversation(req, res, next) {
  try {
    const uid = req.user.uid;
    const convRef = db
      .collection("users")
      .doc(uid)
      .collection("conversations")
      .doc(req.params.id);

    const snap = await convRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Conversation not found" });

    // Delete messages in batches of 500 (Firestore limit)
    let msgsSnap = await convRef.collection("messages").limit(500).get();
    while (!msgsSnap.empty) {
      const batch = db.batch();
      msgsSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      if (msgsSnap.size < 500) break;
      msgsSnap = await convRef.collection("messages").limit(500).get();
    }

    await convRef.delete();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
