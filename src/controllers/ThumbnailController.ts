import { Request, Response } from "express";
import { db } from "../../db";
import { thumbnails } from "../schema";
import { eq } from "drizzle-orm";

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

/**
 * Create a new thumbnail record (no image generation)
 * POST /thumbnails
 */
export const createThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId: userIdRaw, title, user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;
    if (!title || !userIdRaw) return res.status(400).json({ message: "Title and userId are required" });

    const userId = String(userIdRaw).trim();
    if (!isUuid(userId)) return res.status(400).json({ message: "userId must be a UUID" });

    const result = await db.insert(thumbnails).values({
      userId,
      title,
      prompt_used: user_prompt || "",
      style: style || "modern",
      aspect_ratio: aspect_ratio || "16:9",
      color_scheme: color_scheme || "vibrant",
      text_overlay: !!text_overlay,
      isGenerating: false,
    }).returning();

    res.status(201).json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error("createThumbnail error:", error);
    res.status(500).json({ message: error.message || "Failed to create thumbnail" });
  }
};

/**
 * Get all thumbnails for a user
 * GET /thumbnails/:userId
 */
export const getThumbnails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!isUuid(userId)) return res.status(400).json({ message: "userId must be a UUID" });

    const result = await db.select().from(thumbnails).where(eq(thumbnails.userId, userId));
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("getThumbnails error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch thumbnails" });
  }
};

/**
 * Get a single thumbnail by ID
 * GET /thumbnails/:id
 */
export const getThumbnailById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "id is required" });

    // id column is uuid; treat as string
    const result = await db.select().from(thumbnails).where(eq(thumbnails.id, id));
    if (!result || result.length === 0) return res.status(404).json({ message: "Thumbnail not found" });
    res.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error("getThumbnailById error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch thumbnail" });
  }
};

/**
 * Update a thumbnail
 * PUT /thumbnails/:id
 */
export const updateThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, style, aspect_ratio, color_scheme, user_prompt, text_overlay } = req.body;
    if (!id) return res.status(400).json({ message: "id is required" });

    const result = await db.update(thumbnails)
      .set({
        title: title || undefined,
        style: style || undefined,
        aspect_ratio: aspect_ratio || undefined,
        color_scheme: color_scheme || undefined,
        prompt_used: user_prompt || undefined,
        text_overlay: text_overlay !== undefined ? text_overlay : undefined,
      })
      .where(eq(thumbnails.id, id))
      .returning();

    if (result.length === 0) return res.status(404).json({ message: "Thumbnail not found" });
    res.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error("updateThumbnail error:", error);
    res.status(500).json({ message: error.message || "Failed to update thumbnail" });
  }
};

/**
 * Delete a thumbnail
 * DELETE /thumbnails/:id
 */
export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "id is required" });

    const result = await db.delete(thumbnails).where(eq(thumbnails.id, id)).returning();
    if (result.length === 0) return res.status(404).json({ message: "Thumbnail not found" });
    res.json({ success: true, message: "Thumbnail deleted successfully" });
  } catch (error: any) {
    console.error("deleteThumbnail error:", error);
    res.status(500).json({ message: error.message || "Failed to delete thumbnail" });
  }
};

/**
 * Generate thumbnail (image-only)
 * POST /thumbnails/image
 */
export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId: userIdRaw, title, user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;
    if (!title || !userIdRaw) return res.status(400).json({ message: "Title and userId are required" });

    const userId = String(userIdRaw).trim();
    if (!isUuid(userId)) return res.status(400).json({ message: "userId must be a UUID" });

    const [thumbRecord] = await db.insert(thumbnails).values({
      userId,
      title,
      prompt_used: user_prompt || "",
      style: style || "modern",
      aspect_ratio: aspect_ratio || "16:9",
      color_scheme: color_scheme || "vibrant",
      text_overlay: !!text_overlay,
      isGenerating: true,
    }).returning();

    const generatedImageUrl = "https://via.placeholder.com/300x169.png?text=Generated+Thumbnail";

    await db.update(thumbnails)
      .set({ image_url: generatedImageUrl, isGenerating: false })
      .where(eq(thumbnails.id, thumbRecord.id));

    const updated = { ...thumbRecord, prompt_used: user_prompt || "", image_url: generatedImageUrl, isGenerating: false };
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("generateThumbnail error:", error);
    res.status(500).json({ message: error.message || "Failed to generate thumbnail" });
  }
};
