import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";

export function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load grass texture
  const grassTexture = useTexture("/textures/grass.png");
  
  useEffect(() => {
    if (grassTexture) {
      grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
      grassTexture.repeat.set(20, 20);
    }
  }, [grassTexture]);

  // Create a simple grid for the terrain
  const terrainGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(100, 100, 20, 20);
  }, []);

  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.01, 0]}
      receiveShadow
    >
      <primitive object={terrainGeometry} />
      <meshStandardMaterial 
        map={grassTexture}
        roughness={0.8}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
