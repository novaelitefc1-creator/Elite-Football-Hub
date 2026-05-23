import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  recipientName: text("recipient_name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  relatedPlayerId: integer("related_player_id"),
  emailSent: boolean("email_sent").notNull().default(false),
  emailError: text("email_error"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;
