import { useState, useEffect } from "react";
import { useProgress } from "@/lib/stores/useProgress";
import { useChallenges } from "@/lib/stores/useChallenges";
import { useCharacter } from "@/lib/stores/useCharacter";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { CodeEditor } from "../editor/CodeEditor";
import { EditorControls } from "../editor/EditorControls";
import { ProgressIndicator } from "../ui/progress-indicator";
import { Link } from "react-router-dom";

// Helper function to generate mini-map markers
const getMinimapMarkers = () => {
  return [
    { x: 0, z: -15, color: "#7C4DFF", type: "variables" },
    { x: 12, z: 5, color: "#EF5350", type: "loops" },
    { x: -10, z: 8, color: "#43A047", type: "functions" },
  ];
};

export function GameUI() {
  const { phase } = useGame();
  const { currentChallenge, checkSolution, isRunning, setCurrentChallenge } = useChallenges();
  const { currentLevel, experience, addExperience, skills } = useCharacter();
  const { completedChallenges } = useProgress();
  const { playSuccess } = useAudio();
  const [showEditor, setShowEditor] = useState(false);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [minimapOpen, setMinimapOpen] = useState(false);
  const [lastOutputTime, setLastOutputTime] = useState(0);
  const [activeChallengeType, setActiveChallengeType] = useState<string>("description");

  // Initialize code when challenge changes
  useEffect(() => {
    if (currentChallenge) {
      setCode(currentChallenge.starterCode);
    }
  }, [currentChallenge]);
  
  // Only show the interface when the game is in playing phase
  if (phase !== "playing") {
    return null;
  }

  // Handle running code
  const handleRunCode = async () => {
    if (!currentChallenge) return;
    
    try {
      const result = await checkSolution(code);
      setOutput(result.output);
      setLastOutputTime(Date.now());
      
      if (result.success) {
        // Show success feedback
        setToastMessage("Challenge completed! 🎉 XP awarded!");
        setToastType("success");
        setShowToast(true);
        playSuccess();
        
        // Add experience if this is a new completion
        if (!completedChallenges.includes(currentChallenge.id)) {
          addExperience(currentChallenge.experienceReward);
        }
        
        // Auto-close success after a delay
        setTimeout(() => {
          setShowToast(false);
          setTimeout(() => setShowEditor(false), 1000);
        }, 3000);
      } else {
        // Show error feedback
        setToastMessage("Your solution doesn't match the expected output. Try again!");
        setToastType("error");
        setShowToast(true);
        
        // Hide error toast after a delay
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    } catch (error) {
      setOutput(`Error executing code: ${error}`);
      setToastMessage("Error executing your code. Check for syntax errors.");
      setToastType("error");
      setShowToast(true);
    }
  };

  // Handle selecting a challenge from the minimap
  const handleChallengeSelect = (type: string) => {
    setActiveChallengeType(type);
    // Would typically look up challenges based on the type
    // and set the current challenge
    // For now, just close the minimap
    setMinimapOpen(false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top HUD with character stats */}
      <div className="absolute top-0 left-0 right-0 p-2 md:p-4 flex items-center justify-between bg-black/40 backdrop-blur-sm pointer-events-auto z-10 border-b border-primary/20">
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Level Badge */}
          <div className="bg-card p-1 md:p-2 rounded-full h-10 w-10 md:h-12 md:w-12 flex items-center justify-center border-2 border-primary">
            <div className="text-base md:text-lg font-bold text-primary">{currentLevel}</div>
          </div>
          
          {/* XP Bar */}
          <div className="bg-card/80 p-1 md:p-2 rounded-md border border-primary/30 w-28 md:w-48">
            <div className="text-xs text-primary/90 uppercase tracking-wider mb-1 font-bold">XP</div>
            <ProgressIndicator 
              value={experience.current} 
              max={experience.required} 
              label={`${experience.current}/${experience.required}`} 
              className="h-2 md:h-3"
            />
          </div>
          
          {/* Skills summary - desktop only */}
          <div className="hidden md:flex space-x-2 bg-card/80 p-2 rounded-md border border-secondary/30">
            <div className="text-xs font-medium">
              <span className="text-secondary">Variables:</span> {skills.variables}
            </div>
            <div className="text-xs font-medium">
              <span className="text-secondary">Loops:</span> {skills.loops}
            </div>
            <div className="text-xs font-medium">
              <span className="text-secondary">Functions:</span> {skills.functions}
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center space-x-1 md:space-x-2">
          <button
            onClick={() => setMinimapOpen(!minimapOpen)}
            className="bg-card hover:bg-card/80 px-2 md:px-3 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 border border-primary/30 neon-glow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
              <line x1="9" y1="3" x2="9" y2="18"></line>
              <line x1="15" y1="6" x2="15" y2="21"></line>
            </svg>
            <span className="hidden sm:inline">Map</span>
          </button>
          
          <Link 
            to="/profile" 
            className="bg-card hover:bg-card/80 px-2 md:px-3 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 border border-accent/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="hidden sm:inline">Profile</span>
          </Link>
        </div>
      </div>
      
      {/* Mini-map popup */}
      {minimapOpen && (
        <div className="absolute top-20 right-4 w-64 bg-card p-4 rounded-lg border border-primary/30 pointer-events-auto z-20 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-primary">Challenge Map</h3>
            <button 
              onClick={() => setMinimapOpen(false)}
              className="text-foreground/60 hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="relative w-full h-48 bg-black/20 rounded-md overflow-hidden mb-3 border border-foreground/10">
            {/* Visual map with challenge markers */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 border-2 border-accent animate-pulse"></div>
            </div>
            
            {getMinimapMarkers().map((marker, index) => (
              <button
                key={index}
                onClick={() => handleChallengeSelect(marker.type)}
                className="absolute w-6 h-6 rounded-full border-2 hover:scale-125 transition-transform"
                style={{ 
                  backgroundColor: `${marker.color}40`,
                  borderColor: marker.color,
                  left: `${((marker.x + 30) / 60) * 100}%`, 
                  top: `${((marker.z + 30) / 60) * 100}%`,
                }}
                title={`${marker.type.charAt(0).toUpperCase() + marker.type.slice(1)} Challenge`}
              ></button>
            ))}
            
            {/* Player position indicator */}
            <div 
              className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full"
              style={{ 
                left: `50%`,
                top: `50%`,
                transform: 'translate(-50%, -50%)'
              }}
            ></div>
          </div>
          
          <div className="space-y-1 text-xs text-foreground/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#7C4DFF" }}></span>
              <span>Variables Challenge</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EF5350" }}></span>
              <span>Loops Challenge</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#43A047" }}></span>
              <span>Functions Challenge</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom action bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center pointer-events-none">
        {!showEditor && (
          <button
            onClick={() => setShowEditor(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md shadow-lg pointer-events-auto neon-glow flex items-center gap-2 transform hover:scale-105 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            Open Coding Challenge
          </button>
        )}
      </div>
      
      {/* Code editor panel */}
      {showEditor && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto z-50">
          <div className="bg-card w-full max-w-5xl mx-2 md:mx-4 h-[90vh] md:h-[85vh] rounded-lg flex flex-col overflow-hidden border border-primary/30 shadow-2xl mobile-full">
            {/* Challenge header */}
            <div className="p-2 md:p-4 bg-primary text-primary-foreground border-b border-primary/20">
              <div className="flex justify-between items-center">
                <h2 className="text-base md:text-xl font-bold flex items-center gap-1 md:gap-2 truncate">
                  <svg xmlns="http://www.w3.org/2000/svg" className="hidden sm:inline" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 16 4-4-4-4"></path>
                    <path d="m6 8-4 4 4 4"></path>
                    <path d="m14.5 4-5 16"></path>
                  </svg>
                  <span className="truncate">{currentChallenge?.title || "Coding Challenge"}</span>
                </h2>
                <div className="flex items-center gap-1 md:gap-2 ml-2">
                  <span className="px-1 md:px-2 py-1 bg-primary-foreground/20 text-xs rounded-md hidden sm:inline">
                    {currentChallenge?.difficulty || "Beginner"}
                  </span>
                  <span className="px-1 md:px-2 py-1 bg-primary-foreground/20 text-xs rounded-md">
                    XP: {currentChallenge?.experienceReward || 0}
                  </span>
                  <button 
                    onClick={() => setShowEditor(false)}
                    className="hover:bg-primary-foreground/20 p-1 md:p-2 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Mobile tabs for switching between description and editor */}
            <div className="flex md:hidden border-b border-primary/20">
              <button 
                onClick={() => setActiveChallengeType('description')}
                className={`flex-1 py-2 text-sm font-medium ${activeChallengeType !== 'editor' ? 'bg-primary/20 text-primary' : 'bg-card'}`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveChallengeType('editor')}
                className={`flex-1 py-2 text-sm font-medium ${activeChallengeType === 'editor' ? 'bg-primary/20 text-primary' : 'bg-card'}`}
              >
                Editor
              </button>
            </div>
            
            {/* Two-panel layout */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Left panel: description - show based on tab selection on mobile */}
              <div className={`w-full md:w-1/3 p-3 md:p-4 bg-card-foreground/5 overflow-y-auto border-r border-primary/10 ${activeChallengeType === 'editor' ? 'hidden md:block' : 'block'}`}>
                <h3 className="font-bold text-base md:text-lg mb-2 text-secondary">Description</h3>
                <p className="mb-4 text-sm md:text-base text-foreground/90">{currentChallenge?.description}</p>
                
                {currentChallenge?.example && (
                  <div className="mb-4">
                    <h3 className="font-bold text-base md:text-lg mb-2 text-secondary">Example</h3>
                    <pre className="bg-black/30 p-2 md:p-3 rounded text-xs md:text-sm overflow-x-auto font-code">
                      {currentChallenge.example}
                    </pre>
                  </div>
                )}
                
                <div className="bg-card p-3 md:p-4 rounded-md border border-primary/20">
                  <h3 className="font-bold text-xs md:text-sm mb-1 md:mb-2 text-primary">Task</h3>
                  <p className="text-xs md:text-sm text-foreground/90">
                    Complete the code to solve the challenge. Test your solution with the Run button.
                  </p>
                </div>
              </div>
              
              {/* Right panel: editor and output - show based on tab selection on mobile */}
              <div className={`w-full md:w-2/3 flex flex-col ${activeChallengeType !== 'editor' ? 'hidden md:flex' : 'flex'}`}>
                {/* Code editor */}
                <div className="flex-1 overflow-hidden">
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    language="python"
                    theme="vs-dark"
                  />
                </div>
                
                {/* Output area with animation */}
                <div className="h-28 md:h-36 bg-black/60 border-t border-primary/20 overflow-hidden">
                  <div className="p-2 md:p-3 text-xs uppercase tracking-wider font-bold flex justify-between items-center text-foreground/70 bg-black/40">
                    <span>Output</span>
                    <span className="text-primary text-xs">{lastOutputTime > 0 ? new Date(lastOutputTime).toLocaleTimeString() : ''}</span>
                  </div>
                  <div className="p-2 font-mono text-xs md:text-sm overflow-auto h-full">
                    {output ? (
                      <pre className="whitespace-pre-wrap animate-fadeIn">{output}</pre>
                    ) : (
                      <div className="text-foreground/50 italic">Run your code to see the output here</div>
                    )}
                  </div>
                </div>
              </div>
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
      
      {/* Success/Error toast notification */}
      {showToast && (
        <div 
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 sm:px-6 py-2 sm:py-3 rounded-md shadow-lg z-50 pointer-events-auto animate-fadeInDown text-white font-medium flex items-center gap-2 max-w-[90%] sm:max-w-md ${
            toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toastType === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          <span className="text-sm sm:text-base">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
