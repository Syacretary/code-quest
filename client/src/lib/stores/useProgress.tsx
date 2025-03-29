import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiRequest } from "../queryClient";

interface ProgressState {
  // Progress tracking
  completedChallenges: string[];
  unlockedWorlds: string[];
  achievements: string[];
  
  // Actions
  markChallengeComplete: (challengeId: string) => void;
  unlockWorld: (worldId: string) => void;
  addAchievement: (achievementId: string) => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      // Initial state
      completedChallenges: [],
      unlockedWorlds: ["python-dungeon"], // First world unlocked by default
      achievements: [],
      
      // Actions
      markChallengeComplete: (challengeId) => {
        const { completedChallenges } = get();
        
        // Only add if not already completed
        if (!completedChallenges.includes(challengeId)) {
          const newCompletedChallenges = [...completedChallenges, challengeId];
          
          set({ completedChallenges: newCompletedChallenges });
          
          // Save to server
          apiRequest("POST", "/api/progress/challenge", {
            challengeId,
          }).catch(console.error);
        }
      },
      
      unlockWorld: (worldId) => {
        const { unlockedWorlds } = get();
        
        // Only add if not already unlocked
        if (!unlockedWorlds.includes(worldId)) {
          const newUnlockedWorlds = [...unlockedWorlds, worldId];
          
          set({ unlockedWorlds: newUnlockedWorlds });
          
          // Save to server
          apiRequest("POST", "/api/progress/world", {
            worldId,
          }).catch(console.error);
        }
      },
      
      addAchievement: (achievementId) => {
        const { achievements } = get();
        
        // Only add if not already achieved
        if (!achievements.includes(achievementId)) {
          const newAchievements = [...achievements, achievementId];
          
          set({ achievements: newAchievements });
          
          // Save to server
          apiRequest("POST", "/api/progress/achievement", {
            achievementId,
          }).catch(console.error);
        }
      },
    }),
    {
      name: "progress-storage",
    }
  )
);
