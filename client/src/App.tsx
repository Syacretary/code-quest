import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./lib/queryClient";
import { useAudio } from "./lib/stores/useAudio";

// Lazy load pages for better performance
const GamePage = lazy(() => import("./pages/GamePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const NotFound = lazy(() => import("./pages/not-found"));

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Load audio files
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    const hitSfx = new Audio("/sounds/hit.mp3");
    const successSfx = new Audio("/sounds/success.mp3");
    
    setBackgroundMusic(bgMusic);
    setHitSound(hitSfx);
    setSuccessSound(successSfx);
    
    // Simulate loading time for resources
    const timer = setTimeout(() => setIsLoading(false), 1500);
    
    return () => {
      clearTimeout(timer);
      bgMusic.pause();
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  // Check if user is logged in
  const { data: user, isLoading: isCheckingUser } = useQuery({
    queryKey: ["/api/user/current"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading || isCheckingUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/30"
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
        
        <div className="text-center z-10 px-4 max-w-md">
          <h1 className="text-5xl font-bold mb-4 neon-text text-primary tracking-wide">Code Quest</h1>
          <p className="text-xl mb-8 text-secondary">Learn to Code by Playing – Level Up Your Programming Skills!</p>
          
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto neon-glow"></div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-code opacity-80">LOADING</div>
          </div>
          
          <p className="mt-6 text-lg font-code">
            <span className="inline-block animate-pulse">Initializing adventure</span>
            <span className="animate-bounce inline-block">.</span>
            <span className="animate-bounce inline-block delay-100">.</span>
            <span className="animate-bounce inline-block delay-200">.</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/game" />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
