import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  profileImage: text("profile_image"),
  displayName: text("display_name"),
  bio: text("bio"),
  totalPoints: integer("total_points").default(0),
  joinedAt: text("joined_at").default("").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateUserProfileSchema = createInsertSchema(users).pick({
  displayName: true,
  bio: true,
  profileImage: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type User = typeof users.$inferSelect;
