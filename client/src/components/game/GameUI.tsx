import { useState } from "react";
import { useProgress } from "@/lib/stores/useProgress";
import { useChallenges } from "@/lib/stores/useChallenges";
import { useCharacter } from "@/lib/stores/useCharacter";
import { useGame } from "@/lib/stores/useGame";
import { CodeEditor } from "../editor/CodeEditor";
import { EditorControls } from "../editor/EditorControls";
import { ProgressIndicator } from "../ui/progress-indicator";
import { Link } from "react-router-dom";

export function GameUI() {
  const { phase } = useGame();
  const { currentChallenge, checkSolution, isRunning } = useChallenges();
  const { currentLevel, experience, addExperience } = useCharacter();
  const { completedChallenges } = useProgress();
  const [showEditor, setShowEditor] = useState(false);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  // Only show the interface when the game is in playing phase
  if (phase !== "playing") {
    return null;
  }

  // Handle running code
  const handleRunCode = async () => {
    if (!currentChallenge) return;
    
    const result = await checkSolution(code);
    setOutput(result.output);
    
    if (result.success) {
      // Add experience if this is a new completion
      if (!completedChallenges.includes(currentChallenge.id)) {
        addExperience(currentChallenge.experienceReward);
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top bar with character stats */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-black/40 backdrop-blur-sm pointer-events-auto">
        <div className="flex items-center space-x-4">
          <div className="bg-card p-2 rounded-md">
            <div className="text-sm font-bold">Level: {currentLevel}</div>
            <ProgressIndicator 
              value={experience.current} 
              max={experience.required} 
              label={`XP: ${experience.current}/${experience.required}`} 
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link to="/profile" className="bg-card hover:bg-card/80 px-4 py-2 rounded-md text-sm font-medium">
            Profile
          </Link>
          <Link to="/leaderboard" className="bg-card hover:bg-card/80 px-4 py-2 rounded-md text-sm font-medium">
            Leaderboard
          </Link>
        </div>
      </div>
      
      {/* Code challenge button */}
      {!showEditor && (
        <button
          onClick={() => setShowEditor(true)}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md shadow-lg pointer-events-auto"
        >
          Open Coding Challenge
        </button>
      )}
      
      {/* Code editor panel */}
      {showEditor && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-auto">
          <div className="bg-card w-full max-w-4xl h-[80vh] rounded-lg flex flex-col overflow-hidden">
            {/* Challenge header */}
            <div className="p-4 bg-accent text-accent-foreground">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{currentChallenge?.title || "Challenge"}</h2>
                <button 
                  onClick={() => setShowEditor(false)}
                  className="hover:bg-accent-foreground/10 p-2 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Challenge description */}
            <div className="p-4 bg-card-foreground/5">
              <p>{currentChallenge?.description}</p>
              {currentChallenge?.example && (
                <div className="mt-2">
                  <div className="font-bold">Example:</div>
                  <pre className="bg-black/20 p-2 rounded mt-1 text-sm overflow-x-auto">
                    {currentChallenge.example}
                  </pre>
                </div>
              )}
            </div>
            
            {/* Code editor */}
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                value={code}
                onChange={setCode}
                language="python"
                theme="vs-dark"
              />
            </div>
            
            {/* Output area */}
            <div className="h-32 bg-black/30 p-2 font-mono text-sm overflow-auto">
              <div className="font-bold mb-1">Output:</div>
              <pre className="whitespace-pre-wrap">{output}</pre>
            </div>
            
            {/* Controls */}
            <EditorControls 
              onRun={handleRunCode}
              onClose={() => setShowEditor(false)}
              isRunning={isRunning}
            />
          </div>
        </div>
      )}
    </div>
  );
}
