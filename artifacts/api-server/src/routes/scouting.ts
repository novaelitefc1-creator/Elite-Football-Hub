import { Router } from "express";
import { db, scoutingReportsTable } from "@workspace/db";
import { z } from "zod";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const reports = await db.select().from(scoutingReportsTable).orderBy(desc(scoutingReportsTable.createdAt));
  res.json(reports);
});

router.post("/", async (req, res) => {
  const schema = z.object({
    playerName: z.string(),
    age: z.number(),
    position: z.string(),
    nationality: z.string(),
    scoutedAt: z.string(),
    location: z.string(),
    rating: z.number().min(1).max(10),
    notes: z.string(),
    potential: z.string().optional(),
    playerId: z.number().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const [report] = await db.insert(scoutingReportsTable).values(parsed.data).returning();
  res.status(201).json(report);
});

export default router;
