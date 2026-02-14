import express from "express";
import { generateStudioContent, getStudioContent } from "../controllers/studio.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/generate", authenticate, generateStudioContent);
router.get("/:chatId", authenticate, getStudioContent);

export default router;
