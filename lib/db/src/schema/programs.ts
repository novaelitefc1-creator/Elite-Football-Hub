import { pgTable, text, serial, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const programsTable = pgTable("programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ageRange: text("age_range").notNull(),
  duration: text("duration").notNull(),
  level: text("level").notNull(),
  imageUrl: text("image_url"),
  features: text("features").array(),
  price: real("price"),
});

export const insertProgramSchema = createInsertSchema(programsTable).omit({ id: true });
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programsTable.$inferSelect;
