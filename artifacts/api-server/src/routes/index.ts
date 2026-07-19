import { Router, type IRouter } from "express";
import healthRouter from "./health";

// @ts-ignore – JS route files; esbuild bundles them fine for production
import authRoutes from "./authRoutes.js";
// @ts-ignore
import aiRoutes from "./aiRoutes.js";
// @ts-ignore
import historyRoutes from "./historyRoutes.js";
// @ts-ignore
import userRoutes from "./userRoutes.js";
// @ts-ignore
import conversationRoutes from "./conversationRoutes.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRoutes);
router.use("/ai", aiRoutes);
router.use("/history", historyRoutes);
router.use("/user", userRoutes);
router.use("/conversations", conversationRoutes);

export default router;
