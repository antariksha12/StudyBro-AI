import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// Preserved from the old server.js bootstrap — some external checks or
// scripts may already depend on this exact shape, so kept as-is rather
// than merged into /healthz.
router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "StudyBro AI backend" });
});

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
