import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Sky, Stats } from "@react-three/drei";
import { Suspense, useState, useEffect, useRef } from "react";
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
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "jump", keys: ["Space"] },
  { name: "action", keys: ["KeyE"] },
];

// Audio URLs
const AUDIO_URLS = {
  backgroundMusic: "/audio/background-music.mp3",
  hitSound: "/audio/hit.mp3",
  successSound: "/audio/success.mp3"
};

// Create empty audio files
const createDummyAudio = () => {
  const audio = document.createElement('audio');
  audio.volume = 0.5;
  return audio;
};

export function GameScene() {
  const { phase, start } = useGame();
  const { 
    setBackgroundMusic, 
    setHitSound, 
    setSuccessSound, 
    backgroundMusic, 
    isMuted, 
    toggleMute,
    playHit 
  } = useAudio();
  const { selectedAvatar } = useCharacter();
  const [showCanvas, setShowCanvas] = useState(false);
  const initializedAudio = useRef(false);

  // Initialize audio elements when component mounts
  useEffect(() => {
    if (initializedAudio.current) return;
    
    // Create placeholder audio elements first to avoid issues on some browsers
    const bgMusic = createDummyAudio();
    bgMusic.loop = true;
    bgMusic.src = AUDIO_URLS.backgroundMusic;
    
    const hitSfx = createDummyAudio();
    hitSfx.src = AUDIO_URLS.hitSound;
    
    const successSfx = createDummyAudio();
    successSfx.src = AUDIO_URLS.successSound;
    
    // Set them in our store
    setBackgroundMusic(bgMusic);
    setHitSound(hitSfx);
    setSuccessSound(successSfx);
    
    // Mark audio as initialized so we don't try again
    initializedAudio.current = true;
    
    // Play a test sound to prime audio context on user interaction
    document.addEventListener('click', function handleFirstClick() {
      playHit();
      document.removeEventListener('click', handleFirstClick);
    }, { once: true });
    
    console.log('Audio elements initialized');
    
    // Clean up audio elements when component unmounts
    return () => {
      if (bgMusic) bgMusic.pause();
      console.log('Audio elements cleaned up');
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound, playHit]);

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
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 overflow-hidden">
          {/* Background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${Math.random() * 20 + 5}px`,
                  height: `${Math.random() * 20 + 5}px`,
                  background: i % 3 === 0 ? 'rgba(42, 117, 255, 0.3)' : i % 3 === 1 ? 'rgba(0, 209, 102, 0.3)' : 'rgba(255, 184, 0, 0.3)',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.3,
                  animation: `float ${Math.random() * 15 + 10}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>
          
          <div className="bg-card p-8 rounded-xl text-center max-w-xl mx-4 border border-primary/30 relative overflow-hidden neon-glow">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-secondary rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-secondary rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-secondary rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-secondary rounded-br-lg"></div>
            
            <h1 className="text-5xl font-bold mb-2 neon-text text-primary tracking-wide">
              Code Quest
            </h1>
            <p className="text-xl text-secondary mb-2">
              Learn to Code by Playing
            </p>
            <p className="mb-8 text-foreground/90">
              Embark on an adventure to master programming through interactive challenges and epic quests!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartGame}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors neon-glow text-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Start Mission
                </span>
              </button>
              
              <a
                href="/profile"
                className="px-8 py-4 bg-accent/90 text-accent-foreground rounded-lg font-bold hover:bg-accent transition-colors text-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Your Profile
                </span>
              </a>
            </div>
            
            <div className="mt-6 text-xs text-foreground/60 font-code">
              Use W, A, S, D or arrow keys to move. Space to jump. E to interact.
            </div>
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
