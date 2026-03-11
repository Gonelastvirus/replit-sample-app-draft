import { Router } from "express";
import { db, favoritesTable, propertiesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

function mapProperty(p: typeof propertiesTable.$inferSelect) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    listingType: p.listingType,
    propertyType: p.propertyType,
    district: p.district,
    latitude: p.latitude ? Number(p.latitude) : null,
    longitude: p.longitude ? Number(p.longitude) : null,
    priceNpr: Number(p.priceNpr),
    areaDhur: p.areaDhur ? Number(p.areaDhur) : null,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    buildYear: p.buildYear,
    amenities: (p.amenities as string[]) || [],
    photos: (p.photos as string[]) || [],
    videoUrl: p.videoUrl,
    status: p.status,
    featured: p.featured,
    ownerName: p.ownerName,
    ownerPhone: p.ownerPhone,
    ownerWhatsapp: p.ownerWhatsapp,
    rejectionReason: p.rejectionReason,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) { res.status(400).json({ error: "userId required" }); return; }
    const favs = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, String(userId)));
    const ids = favs.map((f) => f.propertyId);
    let properties: ReturnType<typeof mapProperty>[] = [];
    if (ids.length > 0) {
      const props = await db.select().from(propertiesTable)
        .where(sql`${propertiesTable.id} = ANY(${sql.raw(`ARRAY[${ids.join(",")}]`)})`);
      properties = props.map(mapProperty);
    }
    res.json({ favoriteIds: ids, properties });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, propertyId } = req.body;
    if (!userId || !propertyId) { res.status(400).json({ error: "Missing fields" }); return; }
    const existing = await db.select().from(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.propertyId, Number(propertyId)))).limit(1);
    if (existing.length === 0) {
      await db.insert(favoritesTable).values({ userId, propertyId: Number(propertyId) });
    }
    res.status(201).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:propertyId", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) { res.status(400).json({ error: "userId required" }); return; }
    await db.delete(favoritesTable).where(
      and(eq(favoritesTable.userId, String(userId)), eq(favoritesTable.propertyId, Number(req.params.propertyId)))
    );
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
