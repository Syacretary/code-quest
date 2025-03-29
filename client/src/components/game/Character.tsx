import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useCharacter } from "@/lib/stores/useCharacter";

type AvatarType = "wizard" | "warrior" | "rogue";

interface CharacterProps {
  avatarType: AvatarType;
}

export function Character({ avatarType }: CharacterProps) {
  const { camera } = useThree();
  const characterRef = useRef<THREE.Group>(null);
  const [subscribe, getKeys] = useKeyboardControls();
  const { experience, level } = useCharacter();
  
  // Character movement state
  const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0.5, 0));
  const [rotation, setRotation] = useState<number>(0);
  const velocity = useRef<THREE.Vector3>(new THREE.Vector3());
  const speed = useRef(0.15);
  const [isJumping, setIsJumping] = useState(false);
  
  // Character colors based on avatar type
  const getAvatarColor = (): string => {
    switch (avatarType) {
      case "wizard": return "#5D3FD3"; // Purple
      case "warrior": return "#CD5C5C"; // Red
      case "rogue": return "#228B22"; // Green
      default: return "#5D3FD3";
    }
  };

  // Handle character movement and camera following
  useFrame(() => {
    if (!characterRef.current) return;
    
    const { forward, backward, leftward, rightward, jump } = getKeys();
    
    // Reset velocity
    velocity.current.set(0, 0, 0);
    
    // Calculate movement direction
    if (forward) velocity.current.z -= speed.current;
    if (backward) velocity.current.z += speed.current;
    if (leftward) velocity.current.x -= speed.current;
    if (rightward) velocity.current.x += speed.current;

    // Normalize velocity for consistent speed in diagonals
    if (velocity.current.length() > 0) {
      velocity.current.normalize().multiplyScalar(speed.current);
    }
    
    // Update position
    const newPosition = position.clone().add(velocity.current);
    setPosition(newPosition);
    
    // Update rotation based on movement direction
    if (velocity.current.x !== 0 || velocity.current.z !== 0) {
      const angle = Math.atan2(velocity.current.x, velocity.current.z);
      setRotation(angle);
    }
    
    // Handle jumping
    if (jump && !isJumping) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 1000);
    }
    
    // Update character position and rotation
    characterRef.current.position.copy(newPosition);
    characterRef.current.rotation.y = rotation;
    
    // Camera follows character with slight offset and height
    camera.position.x = newPosition.x;
    camera.position.z = newPosition.z + 8;
    camera.position.y = newPosition.y + 5;
    camera.lookAt(newPosition);
  });
  
  return (
    <group ref={characterRef} position={[0, 0.5, 0]}>
      {/* Character base */}
      <mesh castShadow position={[0, isJumping ? 1 : 0, 0]}>
        <boxGeometry args={[1, 1.8, 1]} />
        <meshStandardMaterial color={getAvatarColor()} />
      </mesh>
      
      {/* Character head */}
      <mesh castShadow position={[0, isJumping ? 2.3 : 1.3, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={getAvatarColor()} />
      </mesh>
      
      {/* Character's level indicator above head */}
      <mesh position={[0, isJumping ? 3 : 2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#FFD700" /> {/* Gold color */}
      </mesh>
      
      {/* Face details (eyes) - always facing camera */}
      <group position={[0, isJumping ? 1.5 : 0.5, 0.5]}>
        <mesh position={[-0.2, 0.8, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <mesh position={[0.2, 0.8, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="black" />
        </mesh>
      </group>
    </group>
  );
}
