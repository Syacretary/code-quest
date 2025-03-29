import { Button } from "@/components/ui/button";

interface EditorControlsProps {
  onRun: () => void;
  onClose: () => void;
  isRunning: boolean;
}

export function EditorControls({ onRun, onClose, isRunning }: EditorControlsProps) {
  return (
    <div className="p-4 bg-card flex items-center justify-between">
      <Button 
        onClick={onClose}
        variant="outline"
      >
        Back to Game
      </Button>
      
      <div className="flex items-center space-x-2">
        <Button
          onClick={onRun}
          variant="default"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
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
