import { Router } from "express";
import { db, schedulesTable, teamsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

async function enrichSchedule(schedule: typeof schedulesTable.$inferSelect) {
  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, schedule.teamId)).limit(1);
  return { ...schedule, team: team ?? null };
}

router.get("/", async (req, res) => {
  const { team } = req.query as { team?: string };
  const schedules = await db.select().from(schedulesTable);
  let enriched = await Promise.all(schedules.map(enrichSchedule));
  if (team) enriched = enriched.filter((s) => s.team?.name === team || s.team?.ageGroup === team);
  res.json(enriched);
});

router.post("/", async (req, res) => {
  const schema = z.object({
    teamId: z.number(),
    dayOfWeek: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    location: z.string(),
    type: z.string(),
    notes: z.string().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const [schedule] = await db.insert(schedulesTable).values(parsed.data).returning();
  res.status(201).json(await enrichSchedule(schedule));
});

export default router;
