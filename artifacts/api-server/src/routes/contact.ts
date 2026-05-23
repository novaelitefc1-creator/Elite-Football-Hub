import { Router } from "express";
import { db, contactMessagesTable } from "@workspace/db";
import { z } from "zod";
import { desc } from "drizzle-orm";

const router = Router();

router.post("/", async (req, res) => {
  const schema = z.object({
    name: z.string(),
    email: z.string().email(),
    subject: z.string(),
    message: z.string(),
    phone: z.string().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const [message] = await db.insert(contactMessagesTable).values(parsed.data).returning();
  res.status(201).json(message);
});

router.get("/", async (_req, res) => {
  const messages = await db.select().from(contactMessagesTable).orderBy(desc(contactMessagesTable.createdAt));
  res.json(messages);
});

export default router;
