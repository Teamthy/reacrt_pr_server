import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { db } from "./db";
import { thumbnails } from "./src/schema";
import { sql, eq } from "drizzle-orm";
import usersRouter from "./src/routes/users";
import authRouter from "./src/routes/AuthRoutes";
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use("/api/users", usersRouter);

// Serve React frontend
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.use('/api/auth',authRouter)
// API routes
app.get("/ping", (req, res) => {
  res.send("pong");
});

// DB test
app.get("/test", async (req, res) => {
  try {
    const result = await db.execute(sql`SELECT 1`);
    res.json(result);
  } catch (error) {
    console.error("DB connection error:", error);
    res.status(500).json({ error: "DB connection failed" });
  }
});

// GET all thumbnails
app.get("/thumbnails", async (req, res) => {
  try {
    const all = await db.select().from(thumbnails);
    res.json(all);
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: "Failed to fetch thumbnails" });
  }
});

// GET thumbnail by ID
app.get("/thumbnails/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.select().from(thumbnails).where(eq(thumbnails.id, id));
    res.json(result[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch thumbnail" });
  }
});

// POST new thumbnail
app.post("/thumbnails", async (req, res) => {
  const { title, image_url } = req.body;
  try {
    const result = await db.insert(thumbnails).values({ title, image_url }).returning();
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create thumbnail" });
  }
});

// PUT update thumbnail
app.put("/thumbnails/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, image_url } = req.body;
  try {
    const result = await db
      .update(thumbnails)
      .set({ title, image_url })
      .where(eq(thumbnails.id, id))
      .returning();
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update thumbnail" });
  }
});

// DELETE thumbnail
app.delete("/thumbnails/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.delete(thumbnails).where(eq(thumbnails.id, id)).returning();
    res.json({ success: !!result.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete thumbnail" });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
