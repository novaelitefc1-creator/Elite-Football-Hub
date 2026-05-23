import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { getUserIdFromToken } from "./auth";

const router = Router();

function requireAdmin(req: any, res: any): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  const userId = getUserIdFromToken(authHeader.slice(7));
  if (!userId) {
    res.status(401).json({ error: "Invalid token" });
    return false;
  }
  return true;
}

router.get("/", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { type, unreadOnly } = req.query as { type?: string; unreadOnly?: string };

  let rows = await db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt))
    .limit(100);

  if (type) rows = rows.filter((n) => n.type === type);
  if (unreadOnly === "true") rows = rows.filter((n) => !n.read);
  res.json(rows);
});

router.get("/unread-count", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const [row] = await db
    .select({ count: count() })
    .from(notificationsTable)
    .where(eq(notificationsTable.read, false));
  res.json({ count: row?.count ?? 0 });
});

router.patch("/:id/read", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const [n] = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.id, id))
    .returning();
  if (!n) return res.status(404).json({ error: "Notification not found" });
  res.json(n);
});

router.post("/mark-all-read", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.read, false));
  res.json({ ok: true });
});

export default router;
