import "dotenv/config";
import express from "express";
import cors from "cors";
import { db } from "./db";
import { thumbnails } from "./schema";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/thumbnails", async (req, res) => {
  const all = await db.select().from(thumbnails);
  res.json(all);
});

app.post("/thumbnails", async (req, res) => {
  const { title, imageUrl } = req.body;
  const result = await db.insert(thumbnails).values({ title, imageUrl });
  res.json(result);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
