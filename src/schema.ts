import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const thumbnails = pgTable("thumbnails", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
});
