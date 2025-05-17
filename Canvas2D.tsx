import React, { useRef, useEffect, useState } from 'react';

interface Wall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Canvas2DProps {
  walls: Wall[];
  addWall: (wall: Wall) => void;
}

const Canvas2D: React.FC<Canvas2DProps> = ({ walls, addWall }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = 'black';
    context.lineWidth = 5;
    walls.forEach(wall => {
      context.beginPath();
      context.moveTo(wall.x1, wall.y1);
      context.lineTo(wall.x2, wall.y2);
      context.stroke();
    });

  }, [walls]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setIsDrawing(true);
    setStartPoint({ x, y });
  };

  const handleMouseMove = (/*event: React.MouseEvent<HTMLCanvasElement>*/) => {
    if (!isDrawing || !startPoint) return;
    // We can add logic here to draw a temporary line while dragging
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x2 = event.clientX - rect.left;
    const y2 = event.clientY - rect.top;

    addWall({ x1: startPoint.x, y1: startPoint.y, x2, y2 });
    setIsDrawing(false);
    setStartPoint(null);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ width: '100%', height: '100%', border: '1px solid lightgray' }}
    />
  );
};

export default Canvas2D;

