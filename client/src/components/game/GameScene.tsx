import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Sky, Stats } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";
import { Terrain } from "./Terrain";
import { Character } from "./Character";
import { GameUI } from "./GameUI";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { useCharacter } from "@/lib/stores/useCharacter";
import * as THREE from "three";

// Control mapping for keyboard input
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "jump", keys: ["Space"] },
  { name: "action", keys: ["KeyE"] },
];

export function GameScene() {
  const { phase, start } = useGame();
  const { backgroundMusic, isMuted, toggleMute } = useAudio();
  const { selectedAvatar } = useCharacter();
  const [showCanvas, setShowCanvas] = useState(false);

  // Start background music when the game begins
  useEffect(() => {
    if (backgroundMusic && !isMuted && phase === "playing") {
      backgroundMusic.play().catch(error => {
        console.error("Failed to play background music:", error);
      });
    }
    
    return () => {
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    };
  }, [backgroundMusic, isMuted, phase]);

  // Show the canvas once everything is loaded
  useEffect(() => {
    setShowCanvas(true);
  }, []);

  // Handle starting the game
  const handleStartGame = () => {
    if (phase === "ready") {
      start();
    }
  };

  return (
    <div className="relative w-full h-full">
      {showCanvas && (
        <KeyboardControls map={controls}>
          <Canvas
            shadows
            camera={{
              position: [0, 5, 10],
              fov: 45,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              powerPreference: "default"
            }}
          >
            {/* Debug stats - only in development */}
            {process.env.NODE_ENV === "development" && <Stats />}

            {/* Sky and ambient lighting */}
            <Sky sunPosition={[100, 10, 100]} />
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1} 
              castShadow 
              shadow-mapSize-width={1024} 
              shadow-mapSize-height={1024}
            />

            {/* Game elements */}
            <Suspense fallback={null}>
              <Terrain />
              <Character avatarType={selectedAvatar} />
              
              {/* Environment props could be added here */}
              <mesh 
                position={[5, 0.5, 0]} 
                castShadow
                receiveShadow
              >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="orange" />
              </mesh>
              
              {/* Challenge point */}
              <mesh 
                position={[-5, 0.5, -5]} 
                castShadow
                receiveShadow
              >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="purple" />
              </mesh>
            </Suspense>
          </Canvas>
        </KeyboardControls>
      )}

      {/* Game UI elements */}
      <GameUI />
      
      {/* Start screen overlay */}
      {phase === "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-card p-8 rounded-lg text-center max-w-lg">
            <h1 className="text-4xl font-bold mb-4 font-display text-primary">
              Code Quest
            </h1>
            <p className="mb-6 text-foreground">
              Embark on an adventure to learn programming through fun challenges and quests!
            </p>
            <button
              onClick={handleStartGame}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-bold hover:bg-primary/90 transition-colors"
            >
              Start Adventure
            </button>
          </div>
        </div>
      )}
      
      {/* Audio controls */}
      <button 
        onClick={toggleMute} 
        className="absolute bottom-4 right-4 z-10 p-2 bg-black/50 rounded-full"
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <line x1="3" y1="3" x2="21" y2="21"></line>
            <path d="M18.36 18.36a9.9 9.9 0 0 1-5.36 1.64 10 10 0 0 1-10-10 9.9 9.9 0 0 1 1.64-5.36"></path>
            <path d="M9.73 9.73 15 15a5 5 0 0 0-5.27-5.27"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M12 12a5 5 0 0 0 7.54.54l3-3a9.98 9.98 0 0 1-12.08 12.08"></path>
            <path d="M15.54 8.46a5 5 0 0 0-7.07 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 0-14.14 14.14"></path>
          </svg>
        )}
      </button>
    </div>
  );
}
