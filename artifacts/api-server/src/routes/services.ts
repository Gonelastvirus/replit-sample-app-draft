import { Router } from "express";
import { db, constructionServicesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

function mapService(s: typeof constructionServicesTable.$inferSelect) {
  return {
    id: s.id,
    businessName: s.businessName,
    serviceType: s.serviceType,
    phone: s.phone,
    whatsapp: s.whatsapp,
    district: s.district,
    description: s.description,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const { district, serviceType } = req.query;
    const conditions = [];
    if (district) conditions.push(eq(constructionServicesTable.district, String(district)));
    if (serviceType) conditions.push(eq(constructionServicesTable.serviceType, String(serviceType)));
    const services = await db.select().from(constructionServicesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`${constructionServicesTable.businessName} ASC`);
    res.json({ services: services.map(mapService) });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { businessName, serviceType, phone, whatsapp, district, description } = req.body;
    const [service] = await db.insert(constructionServicesTable).values({
      businessName, serviceType, phone, whatsapp: whatsapp ?? null, district, description: description ?? null,
    }).returning();
    res.status(201).json(mapService(service));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { businessName, serviceType, phone, whatsapp, district, description } = req.body;
    const [updated] = await db.update(constructionServicesTable)
      .set({ businessName, serviceType, phone, whatsapp: whatsapp ?? null, district, description: description ?? null })
      .where(eq(constructionServicesTable.id, Number(req.params.id)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapService(updated));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(constructionServicesTable).where(eq(constructionServicesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
