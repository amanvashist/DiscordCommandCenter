import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const botUsers = pgTable("bot_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  apiKey: text("api_key").notNull(),
  model: text("model").default("poppy-v1"),
  temperature: text("temperature").default("0.7"),
  maxTokens: integer("max_tokens").default(1024),
  isActive: boolean("is_active").default(true),
  role: text("role").default("User"),
  canUseAsk: boolean("can_use_ask").default(true),
  canUseSummary: boolean("can_use_summary").default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertBotUserSchema = createInsertSchema(botUsers).pick({
  username: true,
  apiKey: true,
  model: true,
  temperature: true,
  maxTokens: true,
  isActive: true,
  role: true,
  canUseAsk: true,
  canUseSummary: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBotUser = z.infer<typeof insertBotUserSchema>;
export type BotUser = typeof botUsers.$inferSelect;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// API response schema for authentication
export const authResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    isAdmin: z.boolean(),
  }).optional(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
