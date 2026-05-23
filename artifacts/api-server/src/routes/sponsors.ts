import { Router } from "express";
import { db, sponsorsTable } from "@workspace/db";

const router = Router();

router.get("/", async (_req, res) => {
  const sponsors = await db.select().from(sponsorsTable);
  res.json(sponsors);
});

export default router;
