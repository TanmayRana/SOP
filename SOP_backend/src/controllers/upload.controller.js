import asyncHandler from "express-async-handler";
import { inngest } from "../inngest/client.js";
import cloudinary from "../utils/cloudinary.js";
import Pdf from "../models/pdf.models.js";
import Chat from "../models/chat.models.js";
import fs from "fs";
import crypto from "crypto";

export const uploadPdf = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No PDF files uploaded" });
    }

    const { chatId } = req.body;
    if (!chatId) {
        return res.status(400).json({ message: "chatId is required" });
    }

    const processedFiles = [];

    for (const file of req.files) {
        const pdfId = crypto.randomUUID();

        try {
            // Upload to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(file.path, {
                folder: "sops",
                resource_type: "raw", // Use raw for PDF to avoid issues
            });

            // Save metadata to MongoDB
            await Pdf.create({
                _id: pdfId,
                pdfName: file.originalname,
                pdfUrl: uploadResult.secure_url,
                userId: userId,
                chatId: chatId
            });

            // Associate PDF with Chat
            await Chat.findOneAndUpdate(
                { _id: chatId, userId },
                { $push: { pdfIds: pdfId } }
            );

            // Send to Inngest for processing
            await inngest.send({
                name: "pdf/process",
                data: {
                    userId: userId.toString(),
                    chatId,
                    pdfId,
                    pdfUrl: uploadResult.secure_url,
                    originalName: file.originalname
                },
            });

            processedFiles.push({
                id: pdfId,
                name: file.originalname,
                status: "processing",
                url: uploadResult.secure_url
            });

            // Delete local temp file
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        } catch (error) {
            console.error(`Error uploading ${file.originalname} to Cloudinary:`, error);
            // Optionally cleanup on error too
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

            processedFiles.push({
                id: pdfId,
                name: file.originalname,
                status: "error",
                message: "Cloudinary upload failed"
            });
        }
    }

    res.status(200).json({
        success: true,
        message: "PDFs are being processed",
        files: processedFiles
    });
});
