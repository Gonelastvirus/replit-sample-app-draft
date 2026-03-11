import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const aboutTable = pgTable("about", {
  id: serial("id").primaryKey(),
  mission: text("mission").notNull(),
  vision: text("vision").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email").notNull(),
  address: text("address").notNull(),
  socialLinks: jsonb("social_links").notNull().default({}),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type About = typeof aboutTable.$inferSelect;
