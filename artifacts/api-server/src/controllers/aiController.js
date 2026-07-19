import { db } from "../config/firebaseAdmin.js";
import admin from "../config/firebaseAdmin.js";
import { generateFromText, generateFromImage, generateChat } from "../services/geminiService.js";
import { extractPdfText } from "../services/pdfService.js";
import { searchWeb, formatSearchContext } from "../services/webSearchService.js";
import { todayKey } from "../utils/planLimits.js";

const XP_PER_GENERATION = 10;

/** POST /api/ai/generate — pasted-text input */
export async function generateFromTextHandler(req, res, next) {
  try {
    const { mode, text, language } = req.body;
    if (!mode || !text) {
      return res.status(400).json({ error: "mode and text are required" });
    }

    const model = req.aiModel || "llama-3.3-70b-versatile";
    const content = await generateFromText({ mode, text, language, model });

    const saved = await saveResponseAndRewardXP({ uid: req.user.uid, mode, content, usage: req.usage, kind: "ai" });
    res.json(saved);
  } catch (err) {
    next(err);
  }
}

/** POST /api/ai/generate-file — PDF or image input (multipart/form-data) */
export async function generateFromFileHandler(req, res, next) {
  try {
    const { mode, language, inputType } = req.body;
    if (!mode || !req.file) {
      return res.status(400).json({ error: "mode and a file are required" });
    }

    const model = req.aiModel || "llama-3.3-70b-versatile";
    let content;

    if (inputType === "pdf") {
      const text = await extractPdfText(req.file.buffer);
      content = await generateFromText({ mode, text, language, model });
    } else {
      content = await generateFromImage({
        mode,
        imageBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        language,
        model,
      });
    }

    const saved = await saveResponseAndRewardXP({
      uid: req.user.uid,
      mode,
      content,
      usage: req.usage,
      kind: inputType === "pdf" ? "pdf" : "ai",
    });
    res.json(saved);
  } catch (err) {
    next(err);
  }
}

/** POST /api/ai/chat — conversational study assistant (text or file) */
export async function chatHandler(req, res, next) {
  try {
    const message = req.body.message || "";
    // Guard against literal "undefined" / "null" strings sent from FormData
    const rawConvId = req.body.conversationId;
    const conversationId =
      rawConvId && rawConvId !== "undefined" && rawConvId !== "null" && rawConvId !== ""
        ? rawConvId
        : null;

    if (!message && !req.file) {
      return res.status(400).json({ error: "message or a file is required" });
    }

    const model = req.aiModel || "llama-3.3-70b-versatile";
    const uid = req.user.uid;

    // Fetch recent conversation history so the AI can reference earlier messages
    let history = [];
    if (conversationId) {
      try {
        const snap = await db
          .collection("users").doc(uid)
          .collection("conversations").doc(conversationId)
          .collection("messages")
          .orderBy("createdAt", "desc")
          .limit(10)
          .get();
        // Reverse so messages are in chronological order (oldest → newest)
        history = snap.docs.reverse().map((d) => ({
          role: d.data().role,
          content: d.data().content || "",
        })).filter((m) => m.content);
      } catch {
        // Non-fatal — proceed without history rather than failing the request
      }
    }

    let content;

    // ── Web search (optional, toggled from the frontend) ───────────────────
    // A failure here shouldn't break the chat — fall back to a normal
    // response without search context rather than failing the request.
    let searchContext = "";
    const webSearchOn = req.body.webSearch === "true" || req.body.webSearch === true;
    if (webSearchOn && message) {
      try {
        const results = await searchWeb(message);
        searchContext = formatSearchContext(results);
      } catch (err) {
        console.error("Web search failed:", err.message);
      }
    }

    if (req.file) {
      const inputType = req.body.inputType;
      if (inputType === "pdf") {
        const pdfText = await extractPdfText(req.file.buffer);
        content = await generateChat({ message, pdfText, history, model, searchContext });
      } else {
        content = await generateChat({
          message,
          imageBuffer: req.file.buffer,
          mimeType: req.file.mimetype,
          history,
          model,
          searchContext,
        });
      }
    } else {
      content = await generateChat({ message, history, model, searchContext });
    }

    const userRef = db.collection("users").doc(uid);

    // ── Conversation session ─────────────────────────────────────────────────
    let convRef;
    const isNew = !conversationId;

    if (conversationId) {
      convRef = userRef.collection("conversations").doc(conversationId);
      const existing = await convRef.get();
      if (!existing.exists) {
        // stale / invalid id — treat as new
        convRef = userRef.collection("conversations").doc();
      }
    } else {
      convRef = userRef.collection("conversations").doc();
    }

    const nowTs = admin.firestore.FieldValue.serverTimestamp();
    const title = message
      ? message.slice(0, 60).trim() + (message.length > 60 ? "…" : "")
      : "Uploaded file";

    if (isNew || !(await convRef.get()).exists) {
      await convRef.set({
        title,
        preview: content.slice(0, 120),
        createdAt: nowTs,
        updatedAt: nowTs,
        messageCount: 2,
      });
    } else {
      await convRef.update({
        preview: content.slice(0, 120),
        updatedAt: nowTs,
        messageCount: admin.firestore.FieldValue.increment(2),
      });
    }

    // Save user message
    if (message) {
      await convRef.collection("messages").add({
        role: "user",
        content: message,
        file: req.file ? { name: req.file.originalname, type: req.body.inputType || "file" } : null,
        createdAt: admin.firestore.Timestamp.now(),
      });
    }

    // Save AI response
    const aiMsgRef = await convRef.collection("messages").add({
      role: "assistant",
      content,
      createdAt: admin.firestore.Timestamp.now(),
    });

    // ── XP / usage / streak (unchanged) ─────────────────────────────────────
    const historyRef = userRef.collection("history").doc();
    const usageRef = userRef.collection("usage").doc(todayKey());
    const batch = db.batch();

    batch.set(historyRef, {
      mode: "chat",
      content,
      preview: content.slice(0, 140),
      createdAt: nowTs,
    });

    if (!req.usage?.unlimited) {
      batch.set(usageRef, { ai: admin.firestore.FieldValue.increment(1) }, { merge: true });
    }

    batch.set(
      userRef,
      {
        xp: admin.firestore.FieldValue.increment(XP_PER_GENERATION),
        totalGenerations: admin.firestore.FieldValue.increment(1),
      },
      { merge: true }
    );

    await batch.commit();
    await updateStreak(userRef);

    res.json({
      id: aiMsgRef.id,
      conversationId: convRef.id,
      mode: "chat",
      content,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Shared logic after a successful AI call:
 * - saves the response to Firestore history
 * - increments today's usage counter (for free-plan limits)
 * - awards XP and updates the daily study streak
 */
async function saveResponseAndRewardXP({ uid, mode, content, usage, kind }) {
  const userRef = db.collection("users").doc(uid);
  const historyRef = userRef.collection("history").doc();
  const usageRef = userRef.collection("usage").doc(todayKey());

  const now = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();

  batch.set(historyRef, {
    mode,
    content,
    preview: content.slice(0, 140),
    createdAt: now,
  });

  if (!usage?.unlimited) {
    batch.set(usageRef, { [kind]: admin.firestore.FieldValue.increment(1) }, { merge: true });
  }

  batch.set(
    userRef,
    {
      xp: admin.firestore.FieldValue.increment(XP_PER_GENERATION),
      totalGenerations: admin.firestore.FieldValue.increment(1),
    },
    { merge: true }
  );

  await batch.commit();
  await updateStreak(userRef);

  return { id: historyRef.id, mode, content, createdAt: new Date().toISOString() };
}

/** Increments the streak if the user's last activity was yesterday, resets it if a day was missed. */
async function updateStreak(userRef) {
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const data = snap.data() || {};
    const today = todayKey();
    const lastActive = data.lastActiveDate;

    if (lastActive === today) return; // already counted today

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = lastActive === yesterday ? (data.streak || 0) + 1 : 1;

    tx.set(userRef, { streak: newStreak, lastActiveDate: today }, { merge: true });
  });
}
