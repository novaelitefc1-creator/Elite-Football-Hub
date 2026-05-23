import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const trialsTable = pgTable("trials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  location: text("location").notNull(),
  ageGroup: text("age_group").notNull(),
  spotsAvailable: integer("spots_available").notNull(),
  spotsBooked: integer("spots_booked").notNull().default(0),
  description: text("description"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trialBookingsTable = pgTable("trial_bookings", {
  id: serial("id").primaryKey(),
  trialId: integer("trial_id").notNull().references(() => trialsTable.id),
  playerName: text("player_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  position: text("position").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTrialSchema = createInsertSchema(trialsTable).omit({ id: true, createdAt: true });
export const insertTrialBookingSchema = createInsertSchema(trialBookingsTable).omit({ id: true, createdAt: true });
export type InsertTrial = z.infer<typeof insertTrialSchema>;
export type InsertTrialBooking = z.infer<typeof insertTrialBookingSchema>;
export type Trial = typeof trialsTable.$inferSelect;
export type TrialBooking = typeof trialBookingsTable.$inferSelect;
