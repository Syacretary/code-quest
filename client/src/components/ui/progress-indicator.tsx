import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
}

export function ProgressIndicator({
  value,
  max,
  label,
  className,
}: ProgressIndicatorProps) {
  // Calculate percentage (clamped between 0-100)
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="text-xs font-medium mb-1">{label}</div>
      )}
      <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
