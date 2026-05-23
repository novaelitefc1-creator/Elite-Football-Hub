import { Router } from "express";
import { db, trialBookingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const bookings = await db.select().from(trialBookingsTable).orderBy(trialBookingsTable.createdAt);
  res.json(bookings);
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const [booking] = await db.update(trialBookingsTable).set(req.body).where(eq(trialBookingsTable.id, id)).returning();
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  res.json(booking);
});

export default router;
