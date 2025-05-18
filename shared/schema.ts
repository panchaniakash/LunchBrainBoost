import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  timeEstimate: text("time_estimate").notNull(),
  iconName: text("icon_name").notNull(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gameId: integer("game_id").references(() => games.id),
  score: integer("score").notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

export const hints = pgTable("hints", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id),
  hintText: text("hint_text").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameSchema = createInsertSchema(games);
export const insertScoreSchema = createInsertSchema(scores).omit({ id: true });
export const insertHintSchema = createInsertSchema(hints).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertScore = z.infer<typeof insertScoreSchema>;
export type Score = typeof scores.$inferSelect;

export type InsertHint = z.infer<typeof insertHintSchema>;
export type Hint = typeof hints.$inferSelect;

// Specific game data structures
export interface MemoryCard {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface DailyChallenge {
  id: number;
  gameId: number;
  date: string;
  difficulty: number;
}
