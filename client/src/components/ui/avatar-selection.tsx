import { useCharacter } from "@/lib/stores/useCharacter";
import { cn } from "@/lib/utils";

const avatarTypes = [
  { id: "wizard", name: "Wizard", color: "#5D3FD3", description: "Masters of arcane magic and Python spells" },
  { id: "warrior", name: "Warrior", color: "#CD5C5C", description: "Brave fighters skilled in algorithms and data structures" },
  { id: "rogue", name: "Rogue", color: "#228B22", description: "Stealthy problem-solvers with quick debugging reflexes" },
];

interface AvatarSelectionProps {
  className?: string;
}

export function AvatarSelection({ className }: AvatarSelectionProps) {
  const { selectedAvatar, setAvatar } = useCharacter();
  
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {avatarTypes.map((avatar) => (
        <div
          key={avatar.id}
          className={cn(
            "border-2 rounded-lg p-4 cursor-pointer transition-all",
            selectedAvatar === avatar.id
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          )}
          onClick={() => setAvatar(avatar.id as any)}
        >
          <div 
            className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-white"
            style={{ backgroundColor: avatar.color }}
          >
            {/* Simple avatar representation */}
            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
              {avatar.name.charAt(0)}
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-center mb-2">{avatar.name}</h3>
          <p className="text-sm text-muted-foreground text-center">{avatar.description}</p>
        </div>
      ))}
    </div>
  );
}
