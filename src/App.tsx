import React, { useEffect, useRef } from 'react';
import { CircularTetris } from './game';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<CircularTetris | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 600;
    canvas.height = 600;

    gameRef.current = new CircularTetris(canvas);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameRef.current) return;
      e.preventDefault(); // Prevent page scrolling

      switch (e.key) {
        case 'ArrowLeft':
          gameRef.current.rotateLeft();
          break;
        case 'ArrowRight':
          gameRef.current.rotateRight();
          break;
        case 'ArrowDown':
          gameRef.current.speedUp();
          break;
        case ' ': // Spacebar
          gameRef.current.rotatePiece();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-white mb-8">Circular Tetris</h1>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="bg-gray-800 rounded-full shadow-lg"
        />
      </div>
      <div className="mt-8 text-white text-center">
        <p className="text-xl mb-4">Controls:</p>
        <p>← → Arrow Keys: Rotate ring</p>
        <p>↓ Arrow Key: Speed up</p>
        <p>Spacebar: Rotate piece</p>
      </div>
    </div>
  );
}

export default App;
