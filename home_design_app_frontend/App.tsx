import React from 'react';
import './App.css';
import RoomEditor from './components/RoomEditor/RoomEditor';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Дизайн Дома</h1>
      </header>
      <main className="app-content">
        <RoomEditor />
      </main>
    </div>
  );
}

export default App;
