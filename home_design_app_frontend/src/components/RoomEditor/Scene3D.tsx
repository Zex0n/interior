import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber'; // Removed useLoader
import { OrbitControls, Box, PerspectiveCamera, Grid, Environment, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Removed unused GLTFLoader

// Shared types (could be in a types.ts file)
export interface Wall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface FurnitureItem {
  id: string;
  name: string;
  thumbnailUrl?: string;
  modelUrl: string;
}

export interface PlacedFurnitureItem extends FurnitureItem {
  uniqueId: string; // To ensure unique keys for React lists
  position: [number, number, number];
  rotation: [number, number, number];
  // scale?: [number, number, number]; // Optional scaling
}
// End Shared types

interface Scene3DProps {
  walls: Wall[];
  placedFurniture: PlacedFurnitureItem[];
  onPlaceObject: (position: [number, number, number]) => void;
  selectedModelUrl?: string;
  onSceneReady: (scene: THREE.Scene) => void; // Callback to pass the scene instance
}

const Wall3DComponent: React.FC<{ wall: Wall; wallHeight?: number }> = ({ wall, wallHeight = 25 }) => {
  const scaleFactor = 0.1;
  const p1 = new THREE.Vector3(wall.x1 * scaleFactor, 0, wall.y1 * scaleFactor);
  const p2 = new THREE.Vector3(wall.x2 * scaleFactor, 0, wall.y2 * scaleFactor);
  const wallLength = p1.distanceTo(p2);
  const wallThickness = 1;
  const position = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  position.y = wallHeight / 2;
  const angle = Math.atan2(p2.z - p1.z, p2.x - p1.x);
  return (
    <Box args={[wallLength, wallHeight, wallThickness]} position={position} rotation={[0, -angle + Math.PI / 2, 0]} name="Wall">
      <meshStandardMaterial color="#cccccc" />
    </Box>
  );
};

const LoadedModelComponent: React.FC<{ modelUrl: string; position: [number, number, number]; rotation: [number, number, number]; name: string }> = ({ modelUrl, position, rotation, name }) => {
  try {
    const { scene } = useGLTF(modelUrl);
    const clonedScene = scene.clone();
    clonedScene.name = name;
    return <primitive object={clonedScene} position={position} rotation={rotation} />;
  } catch (error) {
    console.error("Failed to load model:", modelUrl, error);
    return <Box position={position} name={`ErrorPlaceholder-${name}`}><meshStandardMaterial color="red" /><Html><p>Error loading</p></Html></Box>;
  }
};

const CameraControllerComponent: React.FC = () => {
  const { camera } = useThree();
  const speed = 0.5;
  const keys = useRef<{ [key: string]: boolean }>({});
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { keys.current[event.key.toLowerCase()] = true; };
    const handleKeyUp = (event: KeyboardEvent) => { keys.current[event.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  useFrame((_state, delta) => {
    const moveDirection = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    const rightDirection = new THREE.Vector3().crossVectors(camera.up, cameraDirection).normalize();
    if (keys.current['w']) moveDirection.add(cameraDirection);
    if (keys.current['s']) moveDirection.sub(cameraDirection);
    if (keys.current['a']) moveDirection.add(rightDirection);
    if (keys.current['d']) moveDirection.sub(rightDirection);
    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize().multiplyScalar(speed * delta * 60);
      camera.position.add(moveDirection);
    }
  });
  return null;
};

const FloorClickHandlerComponent: React.FC<{ onPlace: (position: [number, number, number]) => void }> = ({ onPlace }) => {
  const { camera, gl } = useThree();
  const handleClick = (event: PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(floorPlane, intersectPoint);

    if (intersectPoint) {
      onPlace([intersectPoint.x, intersectPoint.y, intersectPoint.z]);
    }
  };

  useEffect(() => {
    const canvasElement = gl.domElement;
    canvasElement.addEventListener('pointerdown', handleClick);
    return () => {
      canvasElement.removeEventListener('pointerdown', handleClick);
    };
  }, [gl.domElement, onPlace, camera]);

  return null;
};

const SceneSetup: React.FC<{ onSceneReady: (scene: THREE.Scene) => void }> = ({ onSceneReady }) => {
  const { scene } = useThree();
  useEffect(() => {
    onSceneReady(scene);
  }, [scene, onSceneReady]);
  return null;
};

const Scene3D: React.FC<Scene3DProps> = ({ walls, placedFurniture, onPlaceObject, selectedModelUrl, onSceneReady }) => {
  return (
    <Canvas style={{ width: '100%', height: '100%', background: '#f0f0f0' }}>
      <SceneSetup onSceneReady={onSceneReady} />
      <PerspectiveCamera makeDefault position={[0, 50, 100]} fov={75} />
      <OrbitControls target={[0, 0, 0]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <Environment preset="sunset" />

      {walls.map((wall, index) => (
        <Wall3DComponent key={`wall-${index}`} wall={wall} />
      ))}

      <Suspense fallback={<Html center><p>Загрузка мебели...</p></Html>}>
        {placedFurniture.map((item) => (
          <LoadedModelComponent key={item.uniqueId} modelUrl={item.modelUrl} position={item.position} rotation={item.rotation} name={item.name} />
        ))}
      </Suspense>

      <Grid infiniteGrid cellSize={10} sectionSize={100} sectionColor="#6f6f6f" cellColor="#a5a5a5" fadeDistance={200} />
      <CameraControllerComponent />
      {selectedModelUrl && <FloorClickHandlerComponent onPlace={onPlaceObject} />}
    </Canvas>
  );
};

export default Scene3D;

