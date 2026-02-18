"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const schema_1 = require("./src/schema"); // adjust path if needed
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// GET all thumbnails
app.get("/test", async (req, res) => {
    try {
        const result = await db_1.db.execute(sql `SELECT 1`);
        res.json(result);
    }
    catch (error) {
        console.error("DB connection error:", error);
        res.status(500).json({ error: "DB connection failed" });
    }
});
app.get("/thumbnails", async (req, res) => {
    try {
        const all = await db_1.db.select().from(schema_1.thumbnails);
        res.json(all);
    }
    catch (error) {
        console.error("DB error:", error); // log the real error
        res.status(500).json({ error: "Failed to fetch thumbnails" });
    }
});
// GET thumbnail by ID
app.get("/thumbnails/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db_1.db
            .select()
            .from(schema_1.thumbnails)
            .where(schema_1.thumbnails.id.eq(id));
        res.json(result[0] || {});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch thumbnail" });
    }
});
// POST new thumbnail
app.post("/thumbnails", async (req, res) => {
    const { title, imageUrl } = req.body;
    try {
        const result = await db_1.db.insert(schema_1.thumbnails).values({ title, imageUrl });
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create thumbnail" });
    }
});
// PUT update thumbnail
app.put("/thumbnails/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, imageUrl } = req.body;
    try {
        const result = await db_1.db
            .update(schema_1.thumbnails)
            .set({ title, imageUrl })
            .where(schema_1.thumbnails.id.eq(id));
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update thumbnail" });
    }
});
// DELETE thumbnail
app.delete("/thumbnails/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db_1.db.delete(schema_1.thumbnails).where(schema_1.thumbnails.id.eq(id));
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete thumbnail" });
    }
});
app.get("/ping", (req, res) => {
    res.send("pong");
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
