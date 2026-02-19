import { pgTable, serial, integer, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const thumbnails = pgTable("thumbnails", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  prompt_used: text("prompt_used"),
  style: varchar("style", { length: 50 }).default("modern"),
  aspect_ratio: varchar("aspect_ratio", { length: 20 }).default("16:9"),
  color_scheme: varchar("color_scheme", { length: 50 }).default("vibrant"),
  text_overlay: boolean("text_overlay").default(false),
  image_url: varchar("image_url", { length: 500 }),
  isGenerating: boolean("is_generating").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
