import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "nova_elite_salt").digest("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function generateToken(userId: number): string {
  return Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString("base64");
}

export function getUserIdFromToken(token: string): number | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());
    return decoded.userId ?? null;
  } catch {
    return null;
  }
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(["player", "admin"]).default("player"),
});

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { email, password, firstName, lastName, role } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) return res.status(400).json({ error: "Email already registered" });

  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash: hashPassword(password),
    firstName,
    lastName,
    role,
  }).returning();

  const token = generateToken(user.id);
  res.status(201).json({
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, createdAt: user.createdAt },
    token,
  });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = generateToken(user.id);
  res.json({
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, createdAt: user.createdAt },
    token,
  });
});

router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
  const token = authHeader.slice(7);
  const userId = getUserIdFromToken(token);
  if (!userId) return res.status(401).json({ error: "Invalid token" });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return res.status(401).json({ error: "User not found" });

  res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, createdAt: user.createdAt });
});

export default router;
