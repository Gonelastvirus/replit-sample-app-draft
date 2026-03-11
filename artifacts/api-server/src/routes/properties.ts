import { Router } from "express";
import { db, propertiesTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

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

// GET /properties - approved only
router.get("/", async (req, res) => {
  try {
    const { district, listingType, propertyType, minPrice, maxPrice, minArea, maxArea, bedrooms, amenities, limit = 20, offset = 0 } = req.query;
    const conditions = [eq(propertiesTable.status, "approved")];
    if (district) conditions.push(eq(propertiesTable.district, String(district)));
    if (listingType) conditions.push(eq(propertiesTable.listingType, listingType as "sale" | "rent"));
    if (propertyType) conditions.push(eq(propertiesTable.propertyType, propertyType as "house" | "land" | "apartment" | "commercial"));
    if (minPrice) conditions.push(gte(propertiesTable.priceNpr, String(minPrice)));
    if (maxPrice) conditions.push(lte(propertiesTable.priceNpr, String(maxPrice)));
    if (bedrooms) conditions.push(eq(propertiesTable.bedrooms, Number(bedrooms)));

    const props = await db.select().from(propertiesTable)
      .where(and(...conditions))
      .limit(Number(limit))
      .offset(Number(offset))
      .orderBy(sql`${propertiesTable.createdAt} DESC`);

    const total = await db.select({ count: sql<number>`count(*)` }).from(propertiesTable).where(and(...conditions));
    res.json({ properties: props.map(mapProperty), total: Number(total[0]?.count ?? 0) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /properties/featured
router.get("/featured", async (req, res) => {
  try {
    const props = await db.select().from(propertiesTable)
      .where(and(eq(propertiesTable.status, "approved"), eq(propertiesTable.featured, true)))
      .orderBy(sql`${propertiesTable.createdAt} DESC`)
      .limit(10);
    res.json({ properties: props.map(mapProperty) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /properties/:id
router.get("/:id", async (req, res) => {
  try {
    const [prop] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, Number(req.params.id)));
    if (!prop) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapProperty(prop));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /properties
router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const [prop] = await db.insert(propertiesTable).values({
      title: body.title,
      description: body.description,
      listingType: body.listingType,
      propertyType: body.propertyType,
      district: body.district,
      latitude: body.latitude != null ? String(body.latitude) : null,
      longitude: body.longitude != null ? String(body.longitude) : null,
      priceNpr: String(body.priceNpr),
      areaDhur: body.areaDhur != null ? String(body.areaDhur) : null,
      bedrooms: body.bedrooms ?? null,
      bathrooms: body.bathrooms ?? null,
      buildYear: body.buildYear ?? null,
      amenities: body.amenities || [],
      photos: body.photos || [],
      videoUrl: body.videoUrl ?? null,
      ownerName: body.ownerName,
      ownerPhone: body.ownerPhone,
      ownerWhatsapp: body.ownerWhatsapp ?? null,
      status: "pending",
    }).returning();
    res.status(201).json(mapProperty(prop));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /properties/:id
router.put("/:id", async (req, res) => {
  try {
    const body = req.body;
    const updateData: Partial<typeof propertiesTable.$inferInsert> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.listingType !== undefined) updateData.listingType = body.listingType;
    if (body.propertyType !== undefined) updateData.propertyType = body.propertyType;
    if (body.district !== undefined) updateData.district = body.district;
    if (body.latitude !== undefined) updateData.latitude = body.latitude != null ? String(body.latitude) : null;
    if (body.longitude !== undefined) updateData.longitude = body.longitude != null ? String(body.longitude) : null;
    if (body.priceNpr !== undefined) updateData.priceNpr = String(body.priceNpr);
    if (body.areaDhur !== undefined) updateData.areaDhur = body.areaDhur != null ? String(body.areaDhur) : null;
    if (body.bedrooms !== undefined) updateData.bedrooms = body.bedrooms;
    if (body.bathrooms !== undefined) updateData.bathrooms = body.bathrooms;
    if (body.buildYear !== undefined) updateData.buildYear = body.buildYear;
    if (body.amenities !== undefined) updateData.amenities = body.amenities;
    if (body.photos !== undefined) updateData.photos = body.photos;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.ownerName !== undefined) updateData.ownerName = body.ownerName;
    if (body.ownerPhone !== undefined) updateData.ownerPhone = body.ownerPhone;
    if (body.ownerWhatsapp !== undefined) updateData.ownerWhatsapp = body.ownerWhatsapp;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.featured !== undefined) updateData.featured = body.featured;

    const [updated] = await db.update(propertiesTable)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(propertiesTable.id, Number(req.params.id)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapProperty(updated));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /properties/:id
router.delete("/:id", async (req, res) => {
  try {
    await db.delete(propertiesTable).where(eq(propertiesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
