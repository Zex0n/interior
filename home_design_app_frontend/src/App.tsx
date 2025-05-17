import { useState, useCallback } from 'react';
import { ThemeProvider } from './components/theme-provider';
import Scene3D, { Wall, PlacedFurnitureItem } from './components/RoomEditor/Scene3D';
import Canvas2D from './components/RoomEditor/Canvas2D';
import { useIsMobile } from './hooks/use-mobile';
import { useToast } from './hooks/use-toast';

function App() {
  // Состояние стен
  const [walls, setWalls] = useState<Wall[]>([]);

  // Состояние для расставленной мебели
  const [placedFurniture, setPlacedFurniture] = useState<PlacedFurnitureItem[]>([]);

  // Состояние для выбранной модели
  const [selectedModelUrl, setSelectedModelUrl] = useState<string | undefined>(undefined);

  // Проверка на мобильное устройство
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Обработчик добавления стены
  const handleAddWall = useCallback((wall: Wall) => {
    setWalls(prev => [...prev, wall]);
  }, []);

  // Обработчик размещения объекта
  const handlePlaceObject = useCallback((position: [number, number, number]) => {
    if (selectedModelUrl) {
      const newFurniture: PlacedFurnitureItem = {
        id: `furniture-${Date.now()}`,
        uniqueId: `placed-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: `Item ${placedFurniture.length + 1}`,
        modelUrl: selectedModelUrl,
        position: position,
        rotation: [0, 0, 0]
      };

      setPlacedFurniture(prev => [...prev, newFurniture]);
      toast({
        title: "Объект добавлен",
        description: "Мебель успешно размещена на сцене"
      });

      // Сбрасываем выбранную модель после размещения
      setSelectedModelUrl(undefined);
    }
  }, [selectedModelUrl, placedFurniture, toast]);

  // Обработчик готовности сцены
  const handleSceneReady = useCallback((scene: THREE.Scene) => {
    console.log('3D сцена готова', scene);
  }, []);

  // Пример обработчика выбора модели (можно вызывать из UI)
  const handleSelectModel = useCallback((modelUrl: string) => {
    setSelectedModelUrl(modelUrl);
    toast({
      title: "Модель выбрана",
      description: "Кликните на сцену, чтобы разместить объект"
    });
  }, [toast]);

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen flex flex-col">
        <header className="bg-blue-500 p-4 text-white">
          <h1 className="text-xl font-bold">Редактор интерьера</h1>
        </header>

        <div className="flex-1 flex flex-col md:flex-row">
          {/* Боковая панель с инструментами и каталогом */}
          <aside className="w-full md:w-64 bg-gray-100 p-4">
            <h2 className="font-bold mb-2">Инструменты</h2>
            {/* Пример кнопки для выбора модели */}
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded mb-2"
              onClick={() => handleSelectModel('https://example.com/sample-model.glb')}
            >
              Добавить диван
            </button>

            {selectedModelUrl && (
              <div className="bg-green-100 p-2 rounded mb-2">
                Модель выбрана. Кликните на сцену для размещения.
              </div>
            )}
          </aside>

          {/* Основная область редактирования */}
          <main className="flex-1 flex flex-col md:flex-row">
            {/* 2D редактор */}
            <div className="h-64 md:h-auto md:w-1/2">
              <Canvas2D walls={walls} addWall={handleAddWall} />
            </div>

            {/* 3D редактор */}
            <div className="flex-1">
              <Scene3D
                walls={walls}
                placedFurniture={placedFurniture}
                onPlaceObject={handlePlaceObject}
                selectedModelUrl={selectedModelUrl}
                onSceneReady={handleSceneReady}
              />
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;