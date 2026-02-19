import "dotenv/config";
import { db } from "../db";
import { thumbnails } from "./schema";

async function seed() {
  try {
    await db.delete(thumbnails); // clears table before inserting
    await db.insert(thumbnails).values([
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

    console.log(" Seed data inserted successfully");
  } catch (err) {
    console.error(" Error inserting seed data:", err);
  }
}

seed().then(() => process.exit(0));
