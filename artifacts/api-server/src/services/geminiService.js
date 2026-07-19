import Groq from "groq-sdk";
import "dotenv/config";

if (!process.env.GROQ_API_KEY) {
  console.warn("⚠️  GROQ_API_KEY is not set. AI requests will fail until it's added to secrets.");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Groq vision-capable model used for image inputs.
// The user-selected text model may not support vision, so image routes always
// use this model regardless of the stored preference.
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// Prompt templates for each study tool. Kept in one place so tone and
// output format stay consistent across text, PDF, and image inputs.
const PROMPTS = {
  explain: (content) =>
    `Explain the following study material in simple, plain language a beginner could understand. Use short paragraphs and analogies where helpful. Format with Markdown.\n\n---\n${content}`,
  summarize: (content) =>
    `Summarize the following study material into clear, well-organized bullet points covering only the key ideas. Format with Markdown.\n\n---\n${content}`,
  mcq: (content) =>
    `Create 8 multiple-choice questions from the following study material. For each question give 4 options labeled A-D, and clearly mark the correct answer with a bolded "Answer:" line below it. Format with Markdown.\n\n---\n${content}`,
  flashcards: (content) =>
    `Create 10 flashcards from the following study material. Format each as "**Q:** ... \\n**A:** ..." separated by a horizontal rule. Format with Markdown.\n\n---\n${content}`,
  important: (content) =>
    `List the most important exam-style questions likely to be asked from the following study material, grouped by topic. Format with Markdown.\n\n---\n${content}`,
  quiz: (content) =>
    `Create a short interactive quiz (6 questions, mix of multiple-choice and short answer) from the following study material. Put the answer key at the very end under a "## Answer Key" heading. Format with Markdown.\n\n---\n${content}`,
  translate: (content, language) =>
    `Translate the following study material into ${language || "Hindi"}, keeping the meaning and any technical terms accurate. Format with Markdown.\n\n---\n${content}`,
  revision: (content) =>
    `Create structured, exam-ready revision notes from the following study material, with headings, bullet points, and bolded key terms. Format with Markdown.\n\n---\n${content}`,
};

export function buildPrompt(mode, content, language) {
  const builder = PROMPTS[mode];
  if (!builder) {
    const err = new Error(`Unsupported study mode: ${mode}`);
    err.status = 400;
    throw err;
  }
  return builder(content, language);
}

/**
 * Generates study content from plain text using Groq.
 */
export async function generateFromText({ mode, text, language, model = "llama-3.3-70b-versatile" }) {
  const prompt = buildPrompt(mode, text, language);
  const completion = await groq.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices[0].message.content;
}

/**
 * Generates study content from an uploaded file (PDF text or an image of a page).
 * PDFs have their text pre-extracted (see pdfService) and are sent as plain text.
 * Images are sent inline as base64 to Groq's vision endpoint.
 */
/**
 * Conversational study assistant — understands free-form requests like
 * "summarise this", "make MCQs", "explain simply", etc.
 */
export async function generateChat({ message, imageBuffer, mimeType, pdfText, history = [], model = "llama-3.3-70b-versatile", searchContext }) {
  const systemPrompt = `You are StudyBro AI, an expert and friendly study assistant. Students share notes, articles, and study material with you via text, PDFs, or images. Your job is to help them study effectively.

You can:
- Summarise content into clear bullet points
- Explain concepts in simple language with analogies
- Generate multiple-choice questions (MCQs) with 4 options and clear answers
- Create flashcards in Q/A format separated by horizontal rules
- Build interactive quizzes with an answer key at the end
- Write structured revision notes with headings and key terms bolded
- Translate material to any language accurately
- Answer follow-up questions about the content

Understand natural requests like "summarise this", "give me MCQs", "make flashcards", "explain simply", "quiz me", etc.
If the student shares material without a specific request, offer the most useful output and ask if they'd like anything else.
Always format responses in Markdown for readability. Be concise, accurate, and encouraging.
If asked who created you, who made StudyBro AI, or about the organization behind it, respond that StudyBro AI was created by AntS Studio by Antariksha Sonowal.`;

  // When web search is on, append results as extra context with an
  // instruction to cite sources — kept as a plain text block so it works
  // the same way whether the user also attached a PDF or image.
  const searchBlock = searchContext
    ? `\n\n---\nRelevant web search results — use them to answer accurately and cite sources inline like [1], [2]:\n\n${searchContext}`
    : "";

  if (imageBuffer) {
    const completion = await groq.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBuffer.toString("base64")}` } },
            { type: "text", text: (message || "Please analyse this image and help me study its content.") + searchBlock },
          ],
        },
      ],
    });
    return completion.choices[0].message.content;
  }

  const userContent = (pdfText
    ? `${message || "Please help me study this content:"}\n\n---\n${pdfText}`
    : message) + searchBlock;

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userContent },
    ],
  });
  return completion.choices[0].message.content;
}

export async function generateFromImage({ mode, imageBuffer, mimeType, language }) {
  const instruction = buildPrompt(mode, "the material shown in this image", language);
  const completion = await groq.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBuffer.toString("base64")}`,
            },
          },
          { type: "text", text: instruction },
        ],
      },
    ],
  });
  return completion.choices[0].message.content;
}
