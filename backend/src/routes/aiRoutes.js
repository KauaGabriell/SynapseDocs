import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import aiController from "../controllers/aiController.js";

const router = express.Router();

// protege rota
router.use(authMiddleware);

// POST /api/ai/chat/:projectId
router.post("/chat/:projectId", aiController.chat);

export default router;
