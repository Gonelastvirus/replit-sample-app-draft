import {
  pgTable,
  serial,
  text,
  timestamp,
  pgEnum,
  numeric,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingTypeEnum = pgEnum("listing_type", ["sale", "rent"]);
export const propertyTypeEnum = pgEnum("property_type", ["house", "land", "apartment", "commercial"]);
export const propertyStatusEnum = pgEnum("property_status", ["pending", "approved", "rejected"]);

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  listingType: listingTypeEnum("listing_type").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  district: text("district").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  priceNpr: numeric("price_npr", { precision: 18, scale: 2 }).notNull(),
  areaDhur: numeric("area_dhur", { precision: 10, scale: 2 }),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  buildYear: integer("build_year"),
  amenities: jsonb("amenities").notNull().default([]),
  photos: jsonb("photos").notNull().default([]),
  videoUrl: text("video_url"),
  status: propertyStatusEnum("status").notNull().default("pending"),
  featured: boolean("featured").notNull().default(false),
  ownerName: text("owner_name").notNull(),
  ownerPhone: text("owner_phone").notNull(),
  ownerWhatsapp: text("owner_whatsapp"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
