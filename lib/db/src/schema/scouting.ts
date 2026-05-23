import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scoutingReportsTable = pgTable("scouting_reports", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  age: integer("age").notNull(),
  position: text("position").notNull(),
  nationality: text("nationality").notNull(),
  scoutedAt: text("scouted_at").notNull(),
  location: text("location").notNull(),
  rating: integer("rating").notNull(),
  notes: text("notes").notNull(),
  potential: text("potential"),
  playerId: integer("player_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScoutingReportSchema = createInsertSchema(scoutingReportsTable).omit({ id: true, createdAt: true });
export type InsertScoutingReport = z.infer<typeof insertScoutingReportSchema>;
export type ScoutingReport = typeof scoutingReportsTable.$inferSelect;
