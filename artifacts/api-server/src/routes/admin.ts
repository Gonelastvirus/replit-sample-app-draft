import { Router } from "express";
import { db, propertiesTable } from "@workspace/db";
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

// GET /admin/properties
router.get("/properties", async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const conditions = [];
    if (status) conditions.push(eq(propertiesTable.status, status as "pending" | "approved" | "rejected"));

    const props = await db.select().from(propertiesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(Number(limit))
      .offset(Number(offset))
      .orderBy(sql`${propertiesTable.createdAt} DESC`);
    const total = await db.select({ count: sql<number>`count(*)` }).from(propertiesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    res.json({ properties: props.map(mapProperty), total: Number(total[0]?.count ?? 0) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /admin/properties/:id/approve
router.post("/properties/:id/approve", async (req, res) => {
  try {
    const [updated] = await db.update(propertiesTable)
      .set({ status: "approved", rejectionReason: null, updatedAt: new Date() })
      .where(eq(propertiesTable.id, Number(req.params.id)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapProperty(updated));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /admin/properties/:id/reject
router.post("/properties/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    const [updated] = await db.update(propertiesTable)
      .set({ status: "rejected", rejectionReason: reason || "Rejected by admin", updatedAt: new Date() })
      .where(eq(propertiesTable.id, Number(req.params.id)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapProperty(updated));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /admin/properties/:id/feature
router.post("/properties/:id/feature", async (req, res) => {
  try {
    const { featured } = req.body;
    const [updated] = await db.update(propertiesTable)
      .set({ featured: !!featured, updatedAt: new Date() })
      .where(eq(propertiesTable.id, Number(req.params.id)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapProperty(updated));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
