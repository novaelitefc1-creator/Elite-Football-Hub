import { Router } from "express";
import { db, programsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const programs = await db.select().from(programsTable);
  res.json(programs);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const [program] = await db.select().from(programsTable).where(eq(programsTable.id, id)).limit(1);
  if (!program) return res.status(404).json({ error: "Program not found" });
  res.json(program);
});

export default router;
