import { Router } from "express";
import { db, newsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

router.get("/", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  const query = db.select().from(newsTable).orderBy(desc(newsTable.createdAt));
  const articles = limit ? await query.limit(limit) : await query;
  res.json(articles);
});

router.post("/", async (req, res) => {
  const schema = z.object({
    title: z.string(),
    content: z.string(),
    category: z.string(),
    imageUrl: z.string().nullable().optional(),
    excerpt: z.string().nullable().optional(),
    author: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const [article] = await db.insert(newsTable).values(parsed.data).returning();
  res.status(201).json(article);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const [article] = await db.select().from(newsTable).where(eq(newsTable.id, id)).limit(1);
  if (!article) return res.status(404).json({ error: "Article not found" });
  res.json(article);
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const [article] = await db.update(newsTable).set(req.body).where(eq(newsTable.id, id)).returning();
  if (!article) return res.status(404).json({ error: "Article not found" });
  res.json(article);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  await db.delete(newsTable).where(eq(newsTable.id, id));
  res.status(204).end();
});

export default router;
