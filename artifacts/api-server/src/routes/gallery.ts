import { Router } from "express";
import { db, galleryTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

router.get("/", async (req, res) => {
  const { category } = req.query as { category?: string };
  const images = category
    ? await db.select().from(galleryTable).where(eq(galleryTable.category, category)).orderBy(desc(galleryTable.createdAt))
    : await db.select().from(galleryTable).orderBy(desc(galleryTable.createdAt));
  res.json(images);
});

router.post("/", async (req, res) => {
  const schema = z.object({
    imageUrl: z.string(),
    title: z.string(),
    category: z.string(),
    description: z.string().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const [image] = await db.insert(galleryTable).values(parsed.data).returning();
  res.status(201).json(image);
});

export default router;
