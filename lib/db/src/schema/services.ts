import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const constructionServicesTable = pgTable("construction_services", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  serviceType: text("service_type").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  district: text("district").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertServiceSchema = createInsertSchema(constructionServicesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertService = z.infer<typeof insertServiceSchema>;
export type ConstructionService = typeof constructionServicesTable.$inferSelect;
