import { Request, Response } from "express";
import { db } from "../../db";
import { thumbnails } from "../schema";
import { eq } from "drizzle-orm";

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

// Generate thumbnail (image-only; no text preview generation)
export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId, title, user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;
    if (!title || !userId) return res.status(400).json({ message: "Title and userId are required" });

    // create DB record and mark as generating
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

    // --- Image generation logic (placeholder) ---
    // Replace this block with your real image generation + storage logic.
    // Example: call an image-generation API, upload the image to S3, get the URL.
    const generatedImageUrl = "https://via.placeholder.com/300x169.png?text=Generated+Thumbnail";
    // --------------------------------------------

    // update DB record with image URL and mark generation complete
    await db.update(thumbnails)
      .set({ image_url: generatedImageUrl, isGenerating: false })
      .where(eq(thumbnails.id, thumbRecord.id));

    // return the updated record data
    const updated = { ...thumbRecord, prompt_used: user_prompt || "", image_url: generatedImageUrl, isGenerating: false };
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
