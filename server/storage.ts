import { User, InsertUser, Character, Progress, Leaderboard } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Character operations
  getCharacter(userId: number): Promise<Character | undefined>;
  updateCharacterAvatar(userId: number, avatar: string): Promise<void>;
  updateCharacterExperience(userId: number, experience: number): Promise<void>;
  updateCharacterLevel(userId: number, level: number, experience: number): Promise<void>;
  updateCharacterSkill(userId: number, skill: string, level: number): Promise<void>;
  
  // Progress operations
  getProgress(userId: number): Promise<Progress | undefined>;
  addCompletedChallenge(userId: number, challengeId: string): Promise<void>;
  unlockWorld(userId: number, worldId: string): Promise<void>;
  addAchievement(userId: number, achievementId: string): Promise<void>;
  
  // Leaderboard operations
  getLeaderboard(): Promise<Leaderboard[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  private progress: Map<number, Progress>;
  private leaderboard: Leaderboard[];
  currentId: number;

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.progress = new Map();
    this.leaderboard = [
      { userId: 1, username: "PythonMaster", level: 12, challenges: 15, avatar: "wizard" },
      { userId: 2, username: "CodeWarrior", level: 10, challenges: 12, avatar: "warrior" },
      { userId: 3, username: "BugHunter", level: 9, challenges: 10, avatar: "rogue" },
      { userId: 4, username: "AlgorithmAce", level: 8, challenges: 9, avatar: "wizard" },
      { userId: 5, username: "SyntaxSage", level: 7, challenges: 8, avatar: "wizard" },
    ];
    this.currentId = 1;
    
    // Initialize with a demo user
    this.setupDemoUser();
  }

  // Initialize a demo user for development
  private setupDemoUser() {
    // Demo user
    this.users.set(1, { id: 1, username: "player1", password: "password" });
    
    // Demo character
    this.characters.set(1, {
      userId: 1,
      avatar: "wizard",
      level: 1,
      experience: 0,
      requiredExperience: 100,
      skills: {
        variables: 1,
        loops: 1,
        functions: 1,
        logic: 1,
        dataStructures: 1
      }
    });
    
    // Demo progress
    this.progress.set(1, {
      userId: 1,
      completedChallenges: [],
      unlockedWorlds: ["python-dungeon"],
      achievements: []
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Create default character and progress for new user
    this.characters.set(id, {
      userId: id,
      avatar: "wizard",
      level: 1,
      experience: 0,
      requiredExperience: 100,
      skills: {
        variables: 1,
        loops: 1,
        functions: 1,
        logic: 1,
        dataStructures: 1
      }
    });
    
    this.progress.set(id, {
      userId: id,
      completedChallenges: [],
      unlockedWorlds: ["python-dungeon"],
      achievements: []
    });
    
    return user;
  }

  // Character operations
  async getCharacter(userId: number): Promise<Character | undefined> {
    return this.characters.get(userId);
  }

  async updateCharacterAvatar(userId: number, avatar: string): Promise<void> {
    const character = this.characters.get(userId);
    if (character) {
      character.avatar = avatar;
      this.characters.set(userId, character);
      
      // Update leaderboard
      this.updateLeaderboardEntry(userId);
    }
  }

  async updateCharacterExperience(userId: number, experience: number): Promise<void> {
    const character = this.characters.get(userId);
    if (character) {
      character.experience = experience;
      this.characters.set(userId, character);
    }
  }

  async updateCharacterLevel(userId: number, level: number, experience: number): Promise<void> {
    const character = this.characters.get(userId);
    if (character) {
      character.level = level;
      character.experience = experience;
      character.requiredExperience = Math.floor(100 * Math.pow(1.5, level - 1));
      this.characters.set(userId, character);
      
      // Update leaderboard
      this.updateLeaderboardEntry(userId);
    }
  }

  async updateCharacterSkill(userId: number, skill: string, level: number): Promise<void> {
    const character = this.characters.get(userId);
    if (character && character.skills && skill in character.skills) {
      character.skills[skill as keyof typeof character.skills] = level;
      this.characters.set(userId, character);
    }
  }

  // Progress operations
  async getProgress(userId: number): Promise<Progress | undefined> {
    return this.progress.get(userId);
  }

  async addCompletedChallenge(userId: number, challengeId: string): Promise<void> {
    const progress = this.progress.get(userId);
    if (progress) {
      if (!progress.completedChallenges.includes(challengeId)) {
        progress.completedChallenges.push(challengeId);
        this.progress.set(userId, progress);
        
        // Update leaderboard
        this.updateLeaderboardEntry(userId);
      }
    }
  }

  async unlockWorld(userId: number, worldId: string): Promise<void> {
    const progress = this.progress.get(userId);
    if (progress) {
      if (!progress.unlockedWorlds.includes(worldId)) {
        progress.unlockedWorlds.push(worldId);
        this.progress.set(userId, progress);
      }
    }
  }

  async addAchievement(userId: number, achievementId: string): Promise<void> {
    const progress = this.progress.get(userId);
    if (progress) {
      if (!progress.achievements.includes(achievementId)) {
        progress.achievements.push(achievementId);
        this.progress.set(userId, progress);
      }
    }
  }

  // Leaderboard operations
  async getLeaderboard(): Promise<Leaderboard[]> {
    return this.leaderboard.sort((a, b) => b.level - a.level);
  }

  // Helper method to update leaderboard entry
  private updateLeaderboardEntry(userId: number) {
    const user = this.users.get(userId);
    const character = this.characters.get(userId);
    const progress = this.progress.get(userId);
    
    if (!user || !character || !progress) return;
    
    // Find existing entry or create new one
    let entry = this.leaderboard.find(entry => entry.userId === userId);
    
    if (entry) {
      // Update existing entry
      entry.level = character.level;
      entry.challenges = progress.completedChallenges.length;
      entry.avatar = character.avatar;
    } else {
      // Create new entry
      this.leaderboard.push({
        userId,
        username: user.username,
        level: character.level,
        challenges: progress.completedChallenges.length,
        avatar: character.avatar
      });
    }
  }
}

export const storage = new MemStorage();
