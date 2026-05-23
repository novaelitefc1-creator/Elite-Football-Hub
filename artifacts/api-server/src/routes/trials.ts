import { Router } from "express";
import { db, trialsTable, trialBookingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

router.get("/", async (_req, res) => {
  const trials = await db.select().from(trialsTable).orderBy(trialsTable.date);
  res.json(trials);
});

router.post("/", async (req, res) => {
  const schema = z.object({
    title: z.string(),
    date: z.string(),
    location: z.string(),
    ageGroup: z.string(),
    spotsAvailable: z.number(),
    description: z.string().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const [trial] = await db.insert(trialsTable).values(parsed.data).returning();
  res.status(201).json(trial);
});

router.post("/:id/book", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const [trial] = await db.select().from(trialsTable).where(eq(trialsTable.id, id)).limit(1);
  if (!trial) return res.status(404).json({ error: "Trial not found" });
  if (trial.spotsBooked >= trial.spotsAvailable) return res.status(400).json({ error: "No spots available" });

  const schema = z.object({
    playerName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    dateOfBirth: z.string(),
    position: z.string(),
    notes: z.string().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const [booking] = await db.insert(trialBookingsTable).values({ ...parsed.data, trialId: id }).returning();
  await db.update(trialsTable).set({ spotsBooked: trial.spotsBooked + 1 }).where(eq(trialsTable.id, id));
  res.status(201).json(booking);
});

export default router;
