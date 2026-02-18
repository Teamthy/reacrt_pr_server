"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../db");
const schema_1 = require("./schema");
async function seed() {
    try {
        await db_1.db.delete(schema_1.thumbnails); // clears table before inserting
        await db_1.db.insert(schema_1.thumbnails).values([
            {
                title: "Sunset Beach",
                imageUrl: "https://example.com/sunset.jpg",
            },
            {
                title: "Mountain View",
                imageUrl: "https://example.com/mountain.jpg",
            },
            {
                title: "City Lights",
                imageUrl: "https://example.com/city.jpg",
            },
        ]);
        console.log("✅ Seed data inserted successfully");
    }
    catch (err) {
        console.error("❌ Error inserting seed data:", err);
    }
}
seed().then(() => process.exit(0));
