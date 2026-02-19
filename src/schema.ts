import { pgTable, serial, integer, varchar, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const thumbnails = pgTable("thumbnails", { 
  id: uuid("id").defaultRandom().primaryKey(), 
  userId: uuid("user_id"), // maps to DB column user_id (uuid) 
  title: text("title"), 
  prompt_used: text("prompt_used"), 
  style: text("style"), 
  aspect_ratio: text("aspect_ratio"), 
  color_scheme: text("color_scheme"), 
  text_overlay: text("text_overlay"), 
  image_url: text("image_url"), 
  isGenerating: boolean("is_generating"), 
  createdAt: timestamp("created_at", { mode: "utc" }), 
  updatedAt: timestamp("updated_at", { mode: "utc" }), 
});