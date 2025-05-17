import React from 'react';

interface FurnitureItem {
  id: string;
  name: string;
  thumbnailUrl?: string; // URL to a preview image
  modelUrl: string; // URL or path to the 3D model file (e.g., .gltf)
}

// Placeholder data for now, will be fetched from backend later
const defaultFurniture: FurnitureItem[] = [
  {
    id: 'sofa-1',
    name: 'Современный диван',
    thumbnailUrl: '/thumbnails/sofa.png', // Placeholder path
    modelUrl: '/models/sofa.gltf', // Placeholder path
  },
  {
    id: 'table-1',
    name: 'Кофейный столик',
    thumbnailUrl: '/thumbnails/table.png',
    modelUrl: '/models/table.gltf',
  },
  {
    id: 'chair-1',
    name: 'Офисное кресло',
    thumbnailUrl: '/thumbnails/chair.png',
    modelUrl: '/models/chair.gltf',
  },
];

interface FurnitureLibraryProps {
  onSelectFurniture: (item: FurnitureItem) => void;
  // onUploadCustomModel: (file: File) => void; // To be implemented later
}

const FurnitureLibrary: React.FC<FurnitureLibraryProps> = ({ onSelectFurniture }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Выбран файл для загрузки:', file.name);
      // onUploadCustomModel(file); // Call backend API here
      alert('Загрузка пользовательских моделей будет реализована позже.');
    }
  };

  return (
    <div style={{ padding: '10px', borderLeft: '1px solid #ccc', width: '250px', overflowY: 'auto' }}>
      <h4>Библиотека мебели</h4>
      <div>
        <h5>Загрузить свою модель</h5>
        <input type="file" accept=".gltf,.glb" onChange={handleFileChange} />
      </div>
      <hr style={{ margin: '10px 0' }}/>
      <h5>Готовые модели</h5>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {defaultFurniture.map(item => (
          <li key={item.id} style={{ marginBottom: '10px', cursor: 'pointer', border: '1px solid #eee', padding: '5px' }} onClick={() => onSelectFurniture(item)}>
            {item.thumbnailUrl && <img src={item.thumbnailUrl} alt={item.name} style={{ width: '100%', height: 'auto', marginBottom: '5px', backgroundColor: '#f0f0f0' }} onError={(e) => (e.currentTarget.style.display = 'none')} />}
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FurnitureLibrary;

