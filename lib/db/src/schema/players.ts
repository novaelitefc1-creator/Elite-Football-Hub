import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { teamsTable } from "./teams";

export const playersTable = pgTable("players", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  dateOfBirth: text("date_of_birth").notNull(),
  position: text("position").notNull(),
  nationality: text("nationality").notNull(),
  phone: text("phone").notNull(),
  preferredFoot: text("preferred_foot").notNull().default("right"),
  height: real("height"),
  weight: real("weight"),
  guardianName: text("guardian_name"),
  guardianPhone: text("guardian_phone"),
  passportUrl: text("passport_url"),
  govIdUrl: text("gov_id_url"),
  teamId: integer("team_id").references(() => teamsTable.id),
  bio: text("bio"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlayerSchema = createInsertSchema(playersTable).omit({ id: true, createdAt: true });
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof playersTable.$inferSelect;
