import pdfParse from "pdf-parse";

/**
 * Extracts plain text from an uploaded PDF buffer so it can be sent
 * to Gemini as text (cheaper and more reliable than sending raw PDF bytes).
 */
export async function extractPdfText(buffer) {
  const data = await pdfParse(buffer);
  const text = data.text?.trim();
  if (!text) {
    const err = new Error("Could not extract any text from this PDF. It may be a scanned/image-only PDF.");
    err.status = 422;
    throw err;
  }
  return text;
}
