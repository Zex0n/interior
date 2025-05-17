import React, { useState, useCallback, useRef } from 'react';
import Canvas2D from './Canvas2D';
import Scene3D, { PlacedFurnitureItem, Wall } from './Scene3D';
import FurnitureLibrary from '../FurnitureLibrary/FurnitureLibrary';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as THREE from 'three';

export interface FurnitureItem {
  id: string;
  name: string;
  thumbnailUrl?: string;
  modelUrl: string;
}

const RoomEditor: React.FC = () => {
  const [is3DView, setIs3DView] = useState<boolean>(false);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem | null>(null);
  const [placedFurniture, setPlacedFurniture] = useState<PlacedFurnitureItem[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const toggleView = () => {
    setIs3DView(!is3DView);
  };

  const addWall = (wall: Wall) => {
    setWalls([...walls, wall]);
  };

  const handleSelectFurniture = (item: FurnitureItem) => {
    setSelectedFurniture(item);
    if (is3DView) {
      alert(`Выбрано: ${item.name}. Кликните на пол для размещения.`);
    }
  };

  const placeSelectedItem = useCallback((position: [number, number, number]) => {
    if (selectedFurniture) {
      const newPlacedItem: PlacedFurnitureItem = {
        ...selectedFurniture,
        position,
        rotation: [0, 0, 0],
        uniqueId: `${selectedFurniture.id}-${Date.now()}`
      };
      setPlacedFurniture(prev => [...prev, newPlacedItem]);
      setSelectedFurniture(null);
    }
  }, [selectedFurniture]);

  const handleExportToBlender = () => {
    if (!sceneRef.current) {
      alert("3D сцена не готова для экспорта. Переключитесь в 3D вид и попробуйте снова.");
      return;
    }

    const exporter = new GLTFExporter();
    exporter.parse(
      sceneRef.current,
      (gltf: ArrayBuffer | { [key: string]: any }) => { // Explicitly type gltf
        const output = JSON.stringify(gltf, null, 2);
        const blob = new Blob([output], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'scene.gltf';
        link.click();
        URL.revokeObjectURL(link.href);
      },
      (error: ErrorEvent) => { // Explicitly type error
        console.error('Ошибка при экспорте GLTF:', error);
        alert('Произошла ошибка при экспорте сцены.');
      },
      { binary: false } 
    );
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'row' }}>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button onClick={toggleView} style={{ marginRight: '10px' }}>
              {is3DView ? 'Переключиться на 2D' : 'Переключиться на 3D'}
            </button>
            {is3DView && (
              <button onClick={handleExportToBlender}>
                Экспорт в Blender (.gltf)
              </button>
            )}
          </div>
          {is3DView && selectedFurniture && (
            <span style={{ marginLeft: '10px' }}>Выбрано: {selectedFurniture.name}. Кликните на пол для размещения.</span>
          )}
        </div>
        <div style={{ flexGrow: 1, position: 'relative' }}>
          {!is3DView ? (
            <Canvas2D walls={walls} addWall={addWall} />
          ) : (
            <Scene3D 
              walls={walls} 
              placedFurniture={placedFurniture} 
              onPlaceObject={placeSelectedItem} 
              selectedModelUrl={selectedFurniture?.modelUrl}
              onSceneReady={(scene) => sceneRef.current = scene}
            />
          )}
        </div>
      </div>
      <FurnitureLibrary onSelectFurniture={handleSelectFurniture} />
    </div>
  );
};

export default RoomEditor;

