import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { User, Character, Progress, Leaderboard } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user/current", async (req: Request, res: Response) => {
    try {
      // For demo purposes, return a mock user
      // In a real app, this would use session data
      const mockUser = {
        id: 1,
        username: "player1",
      };
      
      res.json(mockUser);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Character routes
  app.get("/api/character", async (req: Request, res: Response) => {
    try {
      // Get character data for current user
      // In a real app, this would use the user ID from the session
      const character = await storage.getCharacter(1);
      
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/character/avatar", async (req: Request, res: Response) => {
    try {
      const { avatar } = req.body;
      
      if (!avatar) {
        return res.status(400).json({ message: "Avatar type is required" });
      }
      
      // Update avatar for current user
      await storage.updateCharacterAvatar(1, avatar);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/character/experience", async (req: Request, res: Response) => {
    try {
      const { experience } = req.body;
      
      if (experience === undefined) {
        return res.status(400).json({ message: "Experience value is required" });
      }
      
      // Update experience for current user
      await storage.updateCharacterExperience(1, experience);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/character/level", async (req: Request, res: Response) => {
    try {
      const { level, experience } = req.body;
      
      if (level === undefined) {
        return res.status(400).json({ message: "Level value is required" });
      }
      
      // Update level for current user
      await storage.updateCharacterLevel(1, level, experience || 0);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/character/skills", async (req: Request, res: Response) => {
    try {
      const { skill, level } = req.body;
      
      if (!skill || level === undefined) {
        return res.status(400).json({ message: "Skill name and level are required" });
      }
      
      // Update skill for current user
      await storage.updateCharacterSkill(1, skill, level);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Progress routes
  app.post("/api/progress/challenge", async (req: Request, res: Response) => {
    try {
      const { challengeId } = req.body;
      
      if (!challengeId) {
        return res.status(400).json({ message: "Challenge ID is required" });
      }
      
      // Mark challenge as completed for current user
      await storage.addCompletedChallenge(1, challengeId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/progress/world", async (req: Request, res: Response) => {
    try {
      const { worldId } = req.body;
      
      if (!worldId) {
        return res.status(400).json({ message: "World ID is required" });
      }
      
      // Unlock world for current user
      await storage.unlockWorld(1, worldId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/progress/achievement", async (req: Request, res: Response) => {
    try {
      const { achievementId } = req.body;
      
      if (!achievementId) {
        return res.status(400).json({ message: "Achievement ID is required" });
      }
      
      // Add achievement for current user
      await storage.addAchievement(1, achievementId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Leaderboard route
  app.get("/api/leaderboard", async (_req: Request, res: Response) => {
    try {
      // Get leaderboard data
      const leaderboard = await storage.getLeaderboard();
      
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
