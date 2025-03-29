import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiRequest } from "../queryClient";

export type AvatarType = "wizard" | "warrior" | "rogue";

interface CharacterState {
  // Character stats
  selectedAvatar: AvatarType;
  currentLevel: number;
  experience: {
    current: number;
    required: number;
  };
  skills: {
    variables: number;
    loops: number;
    functions: number;
    logic: number;
    dataStructures: number;
  };
  
  // Actions
  setAvatar: (type: AvatarType) => void;
  addExperience: (amount: number) => void;
  levelUp: () => void;
  upgradeSkill: (skill: keyof CharacterState["skills"]) => void;
}

export const useCharacter = create<CharacterState>()(
  persist(
    (set, get) => ({
      // Default character stats
      selectedAvatar: "wizard",
      currentLevel: 1,
      experience: {
        current: 0,
        required: 100,
      },
      skills: {
        variables: 1,
        loops: 1,
        functions: 1,
        logic: 1,
        dataStructures: 1,
      },
      
      // Actions
      setAvatar: (type) => {
        set({ selectedAvatar: type });
        
        // Save to server
        apiRequest("PUT", "/api/character/avatar", { avatar: type })
          .catch(console.error);
      },
      
      addExperience: (amount) => {
        const { experience, currentLevel } = get();
        const newExperience = experience.current + amount;
        
        // Check if level up
        if (newExperience >= experience.required) {
          // Level up and carry over remaining XP
          const remainingXp = newExperience - experience.required;
          set({
            currentLevel: currentLevel + 1,
            experience: {
              current: remainingXp,
              required: Math.floor(experience.required * 1.5), // Increase XP requirement
            },
          });
          
          // Save level up to server
          apiRequest("PUT", "/api/character/level", { 
            level: currentLevel + 1,
            experience: remainingXp,
          }).catch(console.error);
        } else {
          // Just update experience
          set({
            experience: {
              ...experience,
              current: newExperience,
            },
          });
          
          // Save XP to server
          apiRequest("PUT", "/api/character/experience", { 
            experience: newExperience,
          }).catch(console.error);
        }
      },
      
      levelUp: () => {
        const { currentLevel, experience } = get();
        set({
          currentLevel: currentLevel + 1,
          experience: {
            current: 0,
            required: Math.floor(experience.required * 1.5),
          },
        });
        
        // Save to server
        apiRequest("PUT", "/api/character/level", { 
          level: currentLevel + 1,
          experience: 0,
        }).catch(console.error);
      },
      
      upgradeSkill: (skill) => {
        const { skills } = get();
        set({
          skills: {
            ...skills,
            [skill]: skills[skill] + 1,
          },
        });
        
        // Save to server
        apiRequest("PUT", "/api/character/skills", {
          skill,
          level: skills[skill] + 1,
        }).catch(console.error);
      },
    }),
    {
      name: "character-storage",
    }
  )
);
