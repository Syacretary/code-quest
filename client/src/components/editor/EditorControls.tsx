import { Button } from "@/components/ui/button";
import { useState } from "react";

interface EditorControlsProps {
  onRun: () => void;
  onClose: () => void;
  isRunning: boolean;
}

export function EditorControls({ onRun, onClose, isRunning }: EditorControlsProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  return (
    <div className="p-4 bg-card flex items-center justify-between border-t border-primary/20">
      <div className="flex items-center gap-2">
        <Button 
          onClick={onClose}
          variant="outline"
          className="border-secondary/40 hover:bg-secondary/10 hover:text-secondary flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"></path>
            <path d="m12 19-7-7 7-7"></path>
          </svg>
          Return to Game
        </Button>
        
        <Button
          variant="ghost"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setShowShortcuts(!showShortcuts)}
        >
          {showShortcuts ? "Hide Shortcuts" : "Show Shortcuts"}
        </Button>
      </div>
      
      {showShortcuts && (
        <div className="text-xs text-muted-foreground bg-black/30 px-3 py-1 rounded">
          <span className="font-code">Ctrl+Enter</span> - Run Code | 
          <span className="font-code ml-2">Ctrl+S</span> - Save | 
          <span className="font-code ml-2">Esc</span> - Exit
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Button
          onClick={onRun}
          variant="default"
          className="bg-accent text-accent-foreground hover:bg-accent/90 neon-glow-accent px-6"
          disabled={isRunning}
          size="lg"
        >
          {isRunning ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-accent-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Executing Code...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Run Code
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
