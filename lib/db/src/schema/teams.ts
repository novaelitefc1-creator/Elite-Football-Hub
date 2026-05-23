import { pgTable, text, serial, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const teamsTable = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ageGroup: text("age_group").notNull(),
  coach: text("coach").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  playerCount: integer("player_count").notNull().default(0),
  trophies: integer("trophies").notNull().default(0),
  winRate: real("win_rate"),
});

export const insertTeamSchema = createInsertSchema(teamsTable).omit({ id: true });
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teamsTable.$inferSelect;
