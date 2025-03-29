import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";

// Custom component for trees
function Tree({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  // Tree trunk
  const trunkColor = useMemo(() => {
    // Random trunk color variation
    const hue = 0.08 + Math.random() * 0.02; // Brown hue
    const saturation = 0.4 + Math.random() * 0.2;
    const lightness = 0.3 + Math.random() * 0.1;
    return new THREE.Color().setHSL(hue, saturation, lightness);
  }, []);
  
  // Tree top
  const leavesColor = useMemo(() => {
    // Random leaves color variation
    const hue = 0.3 + Math.random() * 0.1; // Green hue
    const saturation = 0.5 + Math.random() * 0.3;
    const lightness = 0.3 + Math.random() * 0.2;
    return new THREE.Color().setHSL(hue, saturation, lightness);
  }, []);
  
  // Random rotation
  const rotation = useMemo(() => [0, Math.random() * Math.PI * 2, 0], []);
  
  return (
    <group position={position} scale={[scale, scale, scale]} rotation={rotation as any}>
      {/* Tree trunk */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.2, 1, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={0.8} />
      </mesh>
      
      {/* Tree top */}
      <mesh castShadow position={[0, 1.3, 0]}>
        <coneGeometry args={[0.5, 1.5, 8]} />
        <meshStandardMaterial color={leavesColor} roughness={0.8} />
      </mesh>
    </group>
  );
}

// Custom component for rocks
function Rock({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  const rockColor = useMemo(() => {
    // Random rock color variation
    const hue = 0.05 + Math.random() * 0.05; // Gray-brown hue
    const saturation = 0.1 + Math.random() * 0.1;
    const lightness = 0.3 + Math.random() * 0.3;
    return new THREE.Color().setHSL(hue, saturation, lightness);
  }, []);
  
  // Random rotation for natural look
  const rotation = useMemo(() => [
    Math.random() * 0.5, 
    Math.random() * Math.PI * 2, 
    Math.random() * 0.5
  ], []);
  
  return (
    <mesh 
      castShadow 
      receiveShadow
      position={position} 
      scale={[scale, scale, scale]} 
      rotation={rotation as any}
    >
      <icosahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color={rockColor} roughness={0.9} />
    </mesh>
  );
}

// Custom component for a path
function Path({ width = 5, length = 40 }: { width?: number, length?: number }) {
  const pathTexture = useTexture("/textures/asphalt.png");
  
  useEffect(() => {
    if (pathTexture) {
      pathTexture.wrapS = pathTexture.wrapT = THREE.RepeatWrapping;
      pathTexture.repeat.set(width/2, length/2);
    }
  }, [pathTexture, width, length]);
  
  return (
    <mesh 
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0.01, 0]}
    >
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial 
        map={pathTexture}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

export function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load grass texture
  const grassTexture = useTexture("/textures/grass.png");
  
  useEffect(() => {
    if (grassTexture) {
      grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
      grassTexture.repeat.set(30, 30);
    }
  }, [grassTexture]);

  // Create terrain with slight elevation variations
  const terrainGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    const position = geometry.attributes.position as THREE.BufferAttribute;
    
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      
      // Skip elevating the central area to keep it flat for gameplay
      const distFromCenter = Math.sqrt(x * x + y * y);
      if (distFromCenter > 20) {
        const elevation = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5;
        position.setZ(i, elevation);
      }
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  // Generate fixed positions for trees 
  const treePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = 40; // Number of trees
    
    for (let i = 0; i < count; i++) {
      // Keep trees away from the center play area
      let x, z;
      const angle = (i / count) * Math.PI * 2; // Distribute in a circle
      const radius = 20 + Math.random() * 30; // Ring of trees around play area
      
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      positions.push([x, 0, z]);
    }
    
    return positions;
  }, []);

  // Generate fixed positions for rocks
  const rockPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = 30; // Number of rocks
    
    for (let i = 0; i < count; i++) {
      let x, z;
      // Distribute rocks randomly, but keep central area clear
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 35;
      
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      // Vary the y position slightly to place some rocks on top of the terrain
      positions.push([x, Math.random() * 0.2, z]);
    }
    
    return positions;
  }, []);

  return (
    <group>
      {/* Main terrain */}
      <mesh 
        ref={meshRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
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
      
      {/* Central path */}
      <Path width={4} length={30} />
      
      {/* Trees */}
      {treePositions.map((position, index) => (
        <Tree 
          key={`tree-${index}`} 
          position={position} 
          scale={0.7 + Math.random() * 0.8} 
        />
      ))}
      
      {/* Rocks */}
      {rockPositions.map((position, index) => (
        <Rock 
          key={`rock-${index}`} 
          position={position} 
          scale={0.5 + Math.random() * 1} 
        />
      ))}
      
      {/* Coding challenge markers */}
      <group position={[0, 0, -15]}>
        <mesh castShadow receiveShadow position={[0, 1, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#4527A0" emissive="#7C4DFF" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[0, 3, 0]} intensity={1} distance={6} color="#7C4DFF" />
      </group>
      
      <group position={[12, 0, 5]}>
        <mesh castShadow receiveShadow position={[0, 1, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#B71C1C" emissive="#EF5350" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[0, 3, 0]} intensity={1} distance={6} color="#EF5350" />
      </group>
      
      <group position={[-10, 0, 8]}>
        <mesh castShadow receiveShadow position={[0, 1, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#1B5E20" emissive="#43A047" emissiveIntensity={0.3} />
        </mesh>
        <pointLight position={[0, 3, 0]} intensity={1} distance={6} color="#43A047" />
      </group>
    </group>
  );
}
