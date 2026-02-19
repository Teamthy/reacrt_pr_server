import { Request, Response } from "express";
import { db } from "../../db";
import { thumbnails } from "../schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Create a new thumbnail
export const createThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId, title, user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;
    if (!title || !userId) return res.status(400).json({ message: "Title and userId are required" });

    const result = await db.insert(thumbnails).values({
      userId,
      title,
      prompt_used: user_prompt || "",
      style: style || "modern",
      aspect_ratio: aspect_ratio || "16:9",
      color_scheme: color_scheme || "vibrant",
      text_overlay: text_overlay || false,
      isGenerating: false,
    }).returning();

    res.status(201).json({ success: true, data: result[0] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all thumbnails for a user
export const getThumbnails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const result = await db.select().from(thumbnails).where(eq(thumbnails.userId, Number(userId)));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single thumbnail by ID
export const getThumbnailById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.select().from(thumbnails).where(eq(thumbnails.id, Number(id)));
    if (result.length === 0) return res.status(404).json({ message: "Thumbnail not found" });
    res.json({ success: true, data: result[0] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update a thumbnail
export const updateThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, style, aspect_ratio, color_scheme, user_prompt, text_overlay } = req.body;

    const result = await db.update(thumbnails)
      .set({
        title: title || undefined,
        style: style || undefined,
        aspect_ratio: aspect_ratio || undefined,
        color_scheme: color_scheme || undefined,
        prompt_used: user_prompt || undefined,
        text_overlay: text_overlay !== undefined ? text_overlay : undefined,
      })
      .where(eq(thumbnails.id, Number(id)))
      .returning();

    if (result.length === 0) return res.status(404).json({ message: "Thumbnail not found" });
    res.json({ success: true, data: result[0] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a thumbnail
export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.delete(thumbnails).where(eq(thumbnails.id, Number(id))).returning();
    if (result.length === 0) return res.status(404).json({ message: "Thumbnail not found" });
    res.json({ success: true, message: "Thumbnail deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Generate thumbnail using Gemini (creates DB record, generates text preview, updates record)
export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId, title, user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;
    if (!title || !userId) return res.status(400).json({ message: "Title and userId are required" });

    const [thumbRecord] = await db.insert(thumbnails).values({
      userId,
      title,
      prompt_used: user_prompt || "",
      style: style || "modern",
      aspect_ratio: aspect_ratio || "16:9",
      color_scheme: color_scheme || "vibrant",
      text_overlay: text_overlay || false,
      isGenerating: true,
    }).returning();

    const geminiPrompt = `Generate a creative thumbnail image description based on the following specifications:
Title: ${title}
Style: ${style || "modern"}
Aspect Ratio: ${aspect_ratio || "16:9"}
Color Scheme: ${color_scheme || "vibrant"}
Text Overlay: ${text_overlay ? "Yes, include text" : "No text overlay"}
User Additional Details: ${user_prompt || "None"}

Please provide a detailed description that could be used to generate this thumbnail image.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: geminiPrompt }] }],
      generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
    });

    const preview = result.response.text();

    await db.update(thumbnails).set({ isGenerating: false, prompt_used: preview }).where(eq(thumbnails.id, thumbRecord.id));

    // Placeholder image generation logic (replace with real image generation + storage)
    const generatedImageUrl = "https://via.placeholder.com/300x169.png?text=Generated+Thumbnail";
    await db.update(thumbnails).set({ image_url: generatedImageUrl }).where(eq(thumbnails.id, thumbRecord.id));

    res.json({ success: true, data: { ...thumbRecord, prompt_used: preview, image_url: generatedImageUrl } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Generate thumbnail preview (text-only description)
export const generateThumbnailPreview = async (req: Request, res: Response) => {
  try {
    const { title, style, aspect_ratio, color_scheme, user_prompt, text_overlay } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const geminiPrompt = `Generate a creative thumbnail image description for:
Title: ${title}
Style: ${style || "modern"}
Aspect Ratio: ${aspect_ratio || "16:9"}
Color Scheme: ${color_scheme || "vibrant"}
Text Overlay: ${text_overlay ? "Yes" : "No"}
Additional Details: ${user_prompt || "None"}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: geminiPrompt }] }],
      generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
    });

    const preview = result.response.text();
    res.json({ success: true, preview });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

