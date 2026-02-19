import express from "express";
import { register, login } from "../controllers/usersController";
import {
  generateThumbnail,
  getThumbnailById,
  createThumbnail,
  getThumbnails
} from '../controllers/thumbnailController';

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);

// Thumbnail routes
router.get("/users/:userId/thumbnails", getThumbnails);
router.get("/thumbnails/:id", getThumbnailById);
router.post("/thumbnails", createThumbnail);
router.post("/thumbnails/image", generateThumbnail);

// Export router
export default router;
