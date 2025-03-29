import { create } from "zustand";
import { executeCode } from "../code-execution";
import { challenges } from "../challenges";
import { useProgress } from "./useProgress";
import { useAudio } from "./useAudio";

export type ChallengeResult = {
  success: boolean;
  output: string;
};

interface ChallengesState {
  // State
  challenges: typeof challenges;
  currentChallengeId: string | null;
  isRunning: boolean;
  
  // Computed
  currentChallenge: typeof challenges[0] | null;
  
  // Actions
  setCurrentChallenge: (id: string) => void;
  checkSolution: (code: string) => Promise<ChallengeResult>;
}

export const useChallenges = create<ChallengesState>((set, get) => ({
  // Initial state
  challenges,
  currentChallengeId: challenges[0]?.id || null,
  isRunning: false,
  
  // Computed values
  get currentChallenge() {
    const { challenges, currentChallengeId } = get();
    return challenges.find(c => c.id === currentChallengeId) || null;
  },
  
  // Actions
  setCurrentChallenge: (id) => {
    set({ currentChallengeId: id });
  },
  
  checkSolution: async (code) => {
    const { currentChallenge } = get();
    const { markChallengeComplete } = useProgress.getState();
    const { playSuccess, playHit } = useAudio.getState();
    
    if (!currentChallenge) {
      return {
        success: false,
        output: "No active challenge found.",
      };
    }
    
    // Set loading state
    set({ isRunning: true });
    
    try {
      // Execute code
      const result = await executeCode(code);
      
      // Check if solution is correct
      const isCorrect = currentChallenge.validateFn(result.output);
      
      if (isCorrect) {
        // Mark challenge as complete
        markChallengeComplete(currentChallenge.id);
        playSuccess();
        
        return {
          success: true,
          output: result.output + "\n\n✅ Great job! Challenge completed successfully.",
        };
      } else {
        playHit();
        
        return {
          success: false,
          output: result.output + "\n\n❌ Not quite right. Check your solution and try again.",
        };
      }
    } catch (error) {
      playHit();
      
      return {
        success: false,
        output: `Error: ${error instanceof Error ? error.message : String(error)}`,
      };
    } finally {
      // Reset loading state
      set({ isRunning: false });
    }
  },
}));
