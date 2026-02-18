import { db } from "./db";
import { thumbnails } from "./schema";
import { dummyThumbnails } from "../assets/thumbnails"; // adjust path if needed

async function main() {
  try {
    // Clear out any old seed data
    await db.delete(thumbnails);

    
    await db.insert(thumbnails).values(
      dummyThumbnails.map((thumb) => ({
        title: thumb.title,
        image_url: thumb.image_url,
      }))
    );

    console.log("Real thumbnails inserted successfully!");
  } catch (err) {
    console.error("Error inserting thumbnails:", err);
    process.exit(1);
  }
}

main();
