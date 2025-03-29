import { pgTable, text, serial, integer, jsonb, array } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Character schema
export interface CharacterSkills {
  variables: number;
  loops: number;
  functions: number;
  logic: number;
  dataStructures: number;
  [key: string]: number;
}

export interface Character {
  userId: number;
  avatar: string;
  level: number;
  experience: number;
  requiredExperience: number;
  skills: CharacterSkills;
}

// Progress schema
export interface Progress {
  userId: number;
  completedChallenges: string[];
  unlockedWorlds: string[];
  achievements: string[];
}

// Leaderboard schema
export interface Leaderboard {
  userId: number;
  username: string;
  level: number;
  challenges: number;
  avatar: string;
}
