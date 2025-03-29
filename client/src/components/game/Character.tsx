import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls, Text } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useCharacter } from "@/lib/stores/useCharacter";
import { useAudio } from "@/lib/stores/useAudio";

type AvatarType = "wizard" | "warrior" | "rogue";

interface CharacterProps {
  avatarType: AvatarType;
}

export function Character({ avatarType }: CharacterProps) {
  const { camera } = useThree();
  const characterRef = useRef<THREE.Group>(null);
  const [subscribe, getKeys] = useKeyboardControls();
  const { currentLevel, experience, skills } = useCharacter();
  const { playHit } = useAudio();
  
  // Character movement state
  const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0.5, 0));
  const [rotation, setRotation] = useState<number>(0);
  const [facingDirection, setFacingDirection] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, -1));
  const velocity = useRef<THREE.Vector3>(new THREE.Vector3());
  const speed = useRef(0.15);
  const [isJumping, setIsJumping] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [bobOffset, setBobOffset] = useState(0);
  
  // Avatar specific properties
  const getAvatarProperties = () => {
    switch (avatarType) {
      case "wizard":
        return {
          bodyColor: "#4527A0", // Deep purple
          accentColor: "#7C4DFF", // Bright purple
          hatColor: "#311B92", // Dark purple
          staffColor: "#B39DDB", // Light purple
          eyeColor: "#FFFFFF",
          symbolColor: "#FFEB3B", // Yellow
        };
      case "warrior":
        return {
          bodyColor: "#B71C1C", // Deep red
          accentColor: "#EF5350", // Lighter red
          armorColor: "#5D4037", // Brown
          weaponColor: "#9E9E9E", // Silver
          eyeColor: "#FFFFFF",
          symbolColor: "#FFC107", // Amber
        };
      case "rogue":
        return {
          bodyColor: "#1B5E20", // Dark green
          accentColor: "#43A047", // Medium green
          cloakColor: "#2E7D32", // Darker green
          weaponColor: "#795548", // Brown
          eyeColor: "#FFFFFF",
          symbolColor: "#FFC107", // Amber
        };
      default:
        return {
          bodyColor: "#4527A0",
          accentColor: "#7C4DFF",
          hatColor: "#311B92",
          staffColor: "#B39DDB",
          eyeColor: "#FFFFFF",
          symbolColor: "#FFEB3B",
        };
    }
  };
  
  const avatarProps = getAvatarProperties();
  
  // Handle character movement and animation
  useFrame((state, delta) => {
    if (!characterRef.current) return;
    
    const { forward, backward, left, right, jump } = getKeys();
    
    // Reset velocity
    velocity.current.set(0, 0, 0);
    
    // Calculate movement direction
    if (forward) velocity.current.z -= speed.current;
    if (backward) velocity.current.z += speed.current;
    if (left) velocity.current.x -= speed.current;
    if (right) velocity.current.x += speed.current;

    // Check if character is moving
    const isCurrentlyMoving = velocity.current.length() > 0;
    if (isCurrentlyMoving !== isMoving) {
      setIsMoving(isCurrentlyMoving);
    }
    
    // Add bobbing animation when moving
    if (isMoving) {
      setBobOffset((prev) => (prev + delta * 5) % (Math.PI * 2));
    }
    
    // Normalize velocity for consistent speed in diagonals
    if (velocity.current.length() > 0) {
      velocity.current.normalize().multiplyScalar(speed.current);
      
      // Update facing direction
      const newFacingDirection = new THREE.Vector3(velocity.current.x, 0, velocity.current.z).normalize();
      setFacingDirection(newFacingDirection);
      
      // Update rotation based on movement direction
      const angle = Math.atan2(velocity.current.x, velocity.current.z);
      setRotation(angle);
    }
    
    // Update position
    const newPosition = position.clone().add(velocity.current);
    setPosition(newPosition);
    
    // Handle jumping
    if (jump && !isJumping) {
      setIsJumping(true);
      playHit(); // Play jump sound
      setTimeout(() => setIsJumping(false), 800);
    }
    
    // Apply position, rotation, and bobbing to character
    const jumpHeight = isJumping ? Math.sin(state.clock.elapsedTime * 5) * 0.5 + 0.7 : 0;
    const bobbingHeight = isMoving ? Math.sin(bobOffset) * 0.1 : 0;
    
    characterRef.current.position.copy(newPosition);
    characterRef.current.position.y += jumpHeight + bobbingHeight;
    characterRef.current.rotation.y = rotation;
    
    // Camera follows character with slight interpolation
    const cameraTargetPosition = new THREE.Vector3(
      newPosition.x,
      newPosition.y + 5,
      newPosition.z + 8
    );
    
    camera.position.lerp(cameraTargetPosition, 0.1);
    camera.lookAt(newPosition.x, newPosition.y + 1, newPosition.z);
  });
  
  // Render avatar based on the selected type
  const renderAvatar = () => {
    switch (avatarType) {
      case "wizard":
        return renderWizard();
      case "warrior":
        return renderWarrior();
      case "rogue":
        return renderRogue();
      default:
        return renderWizard();
    }
  };
  
  // Wizard character
  const renderWizard = () => (
    <group>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 1.8, 8]} />
        <meshStandardMaterial color={avatarProps.bodyColor} />
      </mesh>
      
      {/* Head */}
      <mesh castShadow receiveShadow position={[0, 2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={avatarProps.accentColor} />
      </mesh>
      
      {/* Wizard hat */}
      <group position={[0, 2.3, 0]}>
        <mesh castShadow rotation={[0.1, 0, 0]} position={[0, 0.15, 0]}>
          <coneGeometry args={[0.4, 0.8, 16]} />
          <meshStandardMaterial color={avatarProps.hatColor} />
        </mesh>
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
          <meshStandardMaterial color={avatarProps.hatColor} />
        </mesh>
      </group>
      
      {/* Staff */}
      <mesh castShadow position={[0.5, 0.8, -0.2]} rotation={[0, 0, -Math.PI / 12]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshStandardMaterial color={avatarProps.staffColor} />
      </mesh>
      <mesh castShadow position={[0.6, 1.9, -0.2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={avatarProps.symbolColor} emissive={avatarProps.symbolColor} emissiveIntensity={0.3} />
      </mesh>
      
      {/* Eyes */}
      <group position={[0, 2, 0.25]}>
        <mesh position={[-0.15, 0, 0.1]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={avatarProps.eyeColor} />
        </mesh>
        <mesh position={[0.15, 0, 0.1]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={avatarProps.eyeColor} />
        </mesh>
        <mesh position={[-0.15, 0, 0.15]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <mesh position={[0.15, 0, 0.15]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="black" />
        </mesh>
      </group>
    </group>
  );
  
  // Warrior character
  const renderWarrior = () => (
    <group>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[0.8, 1.8, 0.5]} />
        <meshStandardMaterial color={avatarProps.armorColor} />
      </mesh>
      
      {/* Head */}
      <mesh castShadow receiveShadow position={[0, 2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={avatarProps.bodyColor} />
      </mesh>
      
      {/* Helmet */}
      <mesh castShadow position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.42, 0.45, 0.3, 16]} />
        <meshStandardMaterial color={avatarProps.weaponColor} metalness={0.5} roughness={0.2} />
      </mesh>
      
      {/* Shoulders */}
      <mesh castShadow position={[-0.5, 1.4, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={avatarProps.armorColor} />
      </mesh>
      <mesh castShadow position={[0.5, 1.4, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={avatarProps.armorColor} />
      </mesh>
      
      {/* Sword */}
      <group position={[0.6, 1, -0.2]} rotation={[0.2, 0, -Math.PI / 12]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[0.08, 0.8, 0.02]} />
          <meshStandardMaterial color={avatarProps.weaponColor} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh castShadow position={[0, 0.15, 0]}>
          <boxGeometry args={[0.25, 0.05, 0.05]} />
          <meshStandardMaterial color={avatarProps.weaponColor} metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
      
      {/* Shield */}
      <group position={[-0.5, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.6, 0.05]} />
          <meshStandardMaterial color={avatarProps.weaponColor} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0, 0.03]}>
          <cylinderGeometry args={[0.2, 0.2, 0.01, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color={avatarProps.accentColor} />
        </mesh>
      </group>
      
      {/* Eyes */}
      <group position={[0, 2, 0.25]}>
        <mesh position={[-0.15, 0, 0.15]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={avatarProps.eyeColor} />
        </mesh>
        <mesh position={[0.15, 0, 0.15]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={avatarProps.eyeColor} />
        </mesh>
        <mesh position={[-0.15, 0, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <mesh position={[0.15, 0, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="black" />
        </mesh>
      </group>
    </group>
  );
  
  // Rogue character
  const renderRogue = () => (
    <group>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 1.8, 8]} />
        <meshStandardMaterial color={avatarProps.bodyColor} />
      </mesh>
      
      {/* Head */}
      <mesh castShadow receiveShadow position={[0, 2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={avatarProps.accentColor} />
      </mesh>
      
      {/* Hood */}
      <mesh castShadow position={[0, 2.1, -0.05]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.45, 0.5, 16, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color={avatarProps.cloakColor} />
      </mesh>
      
      {/* Cloak */}
      <mesh castShadow position={[0, 1.2, -0.1]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.9, 1.5, 0.1]} />
        <meshStandardMaterial color={avatarProps.cloakColor} />
      </mesh>
      
      {/* Daggers */}
      <group position={[0.4, 1, 0.2]} rotation={[0, 0, Math.PI / 4]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
        <mesh castShadow position={[0, 0.15, 0]}>
          <boxGeometry args={[0.03, 0.3, 0.01]} />
          <meshStandardMaterial color={avatarProps.weaponColor} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      <group position={[-0.4, 1, 0.2]} rotation={[0, 0, -Math.PI / 4]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
        <mesh castShadow position={[0, 0.15, 0]}>
          <boxGeometry args={[0.03, 0.3, 0.01]} />
          <meshStandardMaterial color={avatarProps.weaponColor} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      
      {/* Eyes */}
      <group position={[0, 2, 0.2]}>
        <mesh position={[-0.15, 0, 0.15]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={avatarProps.eyeColor} />
        </mesh>
        <mesh position={[0.15, 0, 0.15]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={avatarProps.eyeColor} />
        </mesh>
        <mesh position={[-0.15, 0, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <mesh position={[0.15, 0, 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="black" />
        </mesh>
      </group>
    </group>
  );
  
  return (
    <group ref={characterRef} position={[0, 0.5, 0]}>
      {/* Avatar */}
      {renderAvatar()}
      
      {/* Level indicator */}
      <group position={[0, 2.8, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
          <meshStandardMaterial color="#FFC107" emissive="#FFC107" emissiveIntensity={0.3} />
        </mesh>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.2}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {currentLevel}
        </Text>
      </group>
      
      {/* Shadow under character */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
