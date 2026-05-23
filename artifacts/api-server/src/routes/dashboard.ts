import { Router } from "express";
import { db, playersTable, trialBookingsTable, trialsTable, newsTable, contactMessagesTable, teamsTable, schedulesTable } from "@workspace/db";
import { eq, gt, sql } from "drizzle-orm";
import { getUserIdFromToken } from "./auth";

const router = Router();

router.get("/summary", async (_req, res) => {
  const [totalPlayers] = await db.select({ count: sql<number>`count(*)::int` }).from(playersTable);
  const [totalBookings] = await db.select({ count: sql<number>`count(*)::int` }).from(trialBookingsTable);
  const pendingBookingsList = await db.select().from(trialBookingsTable).where(eq(trialBookingsTable.status, "pending"));
  const now = new Date().toISOString().split("T")[0];
  const upcomingTrialsList = await db.select().from(trialsTable).where(gt(trialsTable.date, now));
  const [totalNews] = await db.select({ count: sql<number>`count(*)::int` }).from(newsTable);
  const [recentMessages] = await db.select({ count: sql<number>`count(*)::int` }).from(contactMessagesTable).where(eq(contactMessagesTable.status, "unread"));

  const teams = await db.select().from(teamsTable);
  const players = await db.select().from(playersTable);
  const playersByTeam = teams.map((t) => ({
    team: t.name,
    count: players.filter((p) => p.teamId === t.id).length,
  }));

  const allBookings = await db.select().from(trialBookingsTable);
  const statusCounts = allBookings.reduce((acc: Record<string, number>, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});
  const bookingsByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  res.json({
    totalPlayers: totalPlayers.count,
    totalTrialBookings: totalBookings.count,
    pendingBookings: pendingBookingsList.length,
    upcomingTrials: upcomingTrialsList.length,
    totalNews: totalNews.count,
    recentMessages: recentMessages.count,
    playersByTeam,
    bookingsByStatus,
  });
});

router.get("/player-summary", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
  const userId = getUserIdFromToken(authHeader.slice(7));
  if (!userId) return res.status(401).json({ error: "Invalid token" });

  const [player] = await db.select().from(playersTable).where(eq(playersTable.userId, userId)).limit(1);
  if (!player) return res.status(404).json({ error: "Player profile not found" });

  let teamName: string | null = null;
  if (player.teamId) {
    const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, player.teamId)).limit(1);
    teamName = team?.name ?? null;
  }

  const upcomingSchedules = player.teamId
    ? await db.select().from(schedulesTable).where(eq(schedulesTable.teamId, player.teamId)).limit(5)
    : [];

  res.json({
    player,
    upcomingSchedules,
    trialStatus: null,
    teamName,
  });
});

export default router;
