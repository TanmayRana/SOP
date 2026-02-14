import asyncHandler from "express-async-handler";
import Studio from "../models/studio.models.js";
import { inngest } from "../inngest/client.js";
import mongoose from "mongoose";

export const generateStudioContent = asyncHandler(async (req, res) => {
    const { chatId, toolId } = req.body;
    const userId = req.user._id;

    if (!chatId || !toolId) {
        return res.status(400).json({ message: "chatId and toolId are required" });
    }

    // Trigger background generation via Inngest
    await inngest.send({
        name: "studio/generate.requested",
        data: {
            chatId,
            userId: userId.toString(),
            toolId
        }
    });

    res.status(202).json({
        success: true,
        message: "Generation started in the background"
    });
});

export const getStudioContent = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user._id;

    const items = await Studio.find({ chatId, userId });
    res.status(200).json(items);
});
