// Central place for free-plan daily limits, read from environment variables
// so they can be tuned without a code change.
export const PLAN_LIMITS = {
  free: {
    aiRequestsPerDay: Number(process.env.FREE_DAILY_AI_REQUESTS || 100),
    pdfUploadsPerDay: Number(process.env.FREE_DAILY_PDF_UPLOADS || 2),
  },
  premium: {
    aiRequestsPerDay: Infinity,
    pdfUploadsPerDay: Infinity,
  },
};

export function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD, resets daily
}
