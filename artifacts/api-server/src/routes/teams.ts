import { Router } from "express";
import { db, teamsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const teams = await db.select().from(teamsTable);
  res.json(teams);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, id)).limit(1);
  if (!team) return res.status(404).json({ error: "Team not found" });
  res.json(team);
});

export default router;
