import { Router } from "express";
import { db, aboutTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

const DEFAULT_ABOUT = {
  mission: "To simplify property discovery and connect buyers, sellers, renters, and construction professionals across Nepal.",
  vision: "Becoming the leading housing ecosystem platform in Nepal where everyone can discover land, homes, and construction services in one place.",
  contactPhone: "+977-9800000000",
  contactEmail: "info@slmarketplace.com.np",
  address: "Kathmandu, Bagmati Province, Nepal",
  socialLinks: { facebook: null, instagram: null, twitter: null },
};

router.get("/", async (req, res) => {
  try {
    const [about] = await db.select().from(aboutTable).limit(1);
    if (!about) {
      const [created] = await db.insert(aboutTable).values({
        ...DEFAULT_ABOUT,
        socialLinks: DEFAULT_ABOUT.socialLinks,
      }).returning();
      res.json({ ...created, socialLinks: created.socialLinks, updatedAt: created.updatedAt.toISOString() });
      return;
    }
    res.json({ ...about, socialLinks: about.socialLinks, updatedAt: about.updatedAt.toISOString() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/", async (req, res) => {
  try {
    const { mission, vision, contactPhone, contactEmail, address, socialLinks } = req.body;
    const [existing] = await db.select().from(aboutTable).limit(1);
    let about;
    if (!existing) {
      [about] = await db.insert(aboutTable).values({ mission, vision, contactPhone, contactEmail, address, socialLinks: socialLinks || {} }).returning();
    } else {
      [about] = await db.update(aboutTable)
        .set({ mission, vision, contactPhone, contactEmail, address, socialLinks: socialLinks || {}, updatedAt: new Date() })
        .returning();
    }
    res.json({ ...about, socialLinks: about!.socialLinks, updatedAt: about!.updatedAt.toISOString() });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
