import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const thumbnails = pgTable("thumbnails", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
