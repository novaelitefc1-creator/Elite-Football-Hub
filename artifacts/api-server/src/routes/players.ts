import { Router } from "express";
import { db, playersTable, usersTable, teamsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { getUserIdFromToken } from "./auth";

const router = Router();

async function enrichPlayer(player: typeof playersTable.$inferSelect) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, player.userId)).limit(1);
  let team = null;
  if (player.teamId) {
    const [t] = await db.select().from(teamsTable).where(eq(teamsTable.id, player.teamId)).limit(1);
    team = t ?? null;
  }
  const safeUser = user ? { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, createdAt: user.createdAt } : null;
  return { ...player, user: safeUser, team };
}

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
  const userId = getUserIdFromToken(authHeader.slice(7));
  if (!userId) return res.status(401).json({ error: "Invalid token" });

  const [player] = await db.select().from(playersTable).where(eq(playersTable.userId, userId)).limit(1);
  if (!player) return res.status(404).json({ error: "Player profile not found" });
  res.json(await enrichPlayer(player));
});

router.get("/", async (req, res) => {
  const { team, status } = req.query as { team?: string; status?: string };
  let query = db.select().from(playersTable);
  const conditions = [];
  if (status) conditions.push(eq(playersTable.status, status));
  const players = conditions.length
    ? await db.select().from(playersTable).where(conditions.length === 1 ? conditions[0] : and(...conditions))
    : await db.select().from(playersTable);

  let result = await Promise.all(players.map(enrichPlayer));
  if (team) result = result.filter((p) => p.team?.ageGroup === team || p.team?.name === team);
  res.json(result);
});

router.post("/", async (req, res) => {
  const schema = z.object({
    userId: z.number(),
    dateOfBirth: z.string(),
    position: z.string(),
    nationality: z.string(),
    phone: z.string(),
    preferredFoot: z.string().optional().default("right"),
    height: z.number().nullable().optional(),
    weight: z.number().nullable().optional(),
    guardianName: z.string().nullable().optional(),
    guardianPhone: z.string().nullable().optional(),
    passportUrl: z.string().nullable().optional(),
    govIdUrl: z.string().nullable().optional(),
    teamId: z.number().nullable().optional(),
    bio: z.string().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const [player] = await db.insert(playersTable).values(parsed.data).returning();
  res.status(201).json(await enrichPlayer(player));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const [player] = await db.select().from(playersTable).where(eq(playersTable.id, id)).limit(1);
  if (!player) return res.status(404).json({ error: "Player not found" });
  res.json(await enrichPlayer(player));
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const [player] = await db.update(playersTable).set(req.body).where(eq(playersTable.id, id)).returning();
  if (!player) return res.status(404).json({ error: "Player not found" });
  res.json(await enrichPlayer(player));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  await db.delete(playersTable).where(eq(playersTable.id, id));
  res.status(204).end();
});

export default router;
