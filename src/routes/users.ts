import express from "express";
import { register, login } from "../controllers/usersController";
import { generateThumbnailPreview, generateThumbnail } from '../controllers/thumbnailController';

const router = express.Router(); // router must be declared first

// Auth routes
router.post("/register", register);
router.post("/login", login);

// Thumbnail routes
router.post("/thumbnails/preview", generateThumbnailPreview); // text-only preview
router.post("/thumbnails/image", generateThumbnail);           // full thumbnail generation (with image)

// Export router
export default router;
