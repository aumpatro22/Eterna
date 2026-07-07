import { useEffect, useRef, useState } from 'react';

export default function DoodleOverlay({ active }) {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#ff4d4d'); // Default marker red
  const [lineWidth, setLineWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const pathsRef = useRef([]); // Stores paths: { id, color, width, points: [{x, y}], timestamp }

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Animation Loop for Fading Ink
    let animId;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();
      const fadeDuration = 8000; // 8 seconds

      // Filter out paths older than 8 seconds
      pathsRef.current = pathsRef.current.filter((p) => now - p.timestamp < fadeDuration);

      pathsRef.current.forEach((path) => {
        if (path.points.length < 2) return;

        const age = now - path.timestamp;
        const opacity = Math.max(0, 1 - age / fadeDuration);

        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = opacity;

        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
      });

      ctx.globalAlpha = 1.0; // Reset
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animId);
    };
  }, [active]);

  const startDrawing = (e) => {
    if (!active) return;
    
    // Support touch events
    const isTouch = e.touches && e.touches.length > 0;
    const x = isTouch ? e.touches[0].clientX : e.clientX;
    const y = isTouch ? e.touches[0].clientY : e.clientY;
    
    setIsDrawing(true);

    pathsRef.current.push({
      id: Math.random().toString(),
      color,
      width: lineWidth,
      points: [{ x, y }],
      timestamp: Date.now(),
    });
  };

  const drawMove = (e) => {
    if (!isDrawing || !active) return;
    
    // Prevent scrolling on mobile while drawing
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const isTouch = e.touches && e.touches.length > 0;
    const x = isTouch ? e.touches[0].clientX : e.clientX;
    const y = isTouch ? e.touches[0].clientY : e.clientY;

    const currentPath = pathsRef.current[pathsRef.current.length - 1];
    if (currentPath) {
      currentPath.points.push({ x, y });
      // Keep updating timestamp while drawing so it doesn't fade while actively scribbling
      currentPath.timestamp = Date.now();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none select-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto cursor-pencil"
        onMouseDown={startDrawing}
        onMouseMove={drawMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={drawMove}
        onTouchEnd={stopDrawing}
      />
      {/* Floating Canvas Brush Controls */}
      <div className="absolute bottom-6 right-6 bg-white border-[3px] border-ink p-4 wobbly-sm shadow-hard pointer-events-auto flex flex-col gap-4 select-none animate-bounce">
        <h4 className="font-kalam text-xl text-center">Pencil Box ✏️</h4>
        
        {/* Colors */}
        <div className="flex gap-3 justify-center" role="group" aria-label="Color selection">
          <button
            onClick={() => setColor('#ff4d4d')}
            className={`w-8 h-8 rounded-full border-2 border-ink ${color === '#ff4d4d' ? 'ring-2 ring-offset-2 ring-marker' : ''}`}
            style={{ backgroundColor: '#ff4d4d' }}
            title="Red Marker"
            aria-label="Red Marker"
            aria-pressed={color === '#ff4d4d'}
          />
          <button
            onClick={() => setColor('#2d5da1')}
            className={`w-8 h-8 rounded-full border-2 border-ink ${color === '#2d5da1' ? 'ring-2 ring-offset-2 ring-pen' : ''}`}
            style={{ backgroundColor: '#2d5da1' }}
            title="Blue Pen"
            aria-label="Blue Pen"
            aria-pressed={color === '#2d5da1'}
          />
          <button
            onClick={() => setColor('#2d2d2d')}
            className={`w-8 h-8 rounded-full border-2 border-ink ${color === '#2d2d2d' ? 'ring-2 ring-offset-2 ring-ink' : ''}`}
            style={{ backgroundColor: '#2d2d2d' }}
            title="Sketch Pencil"
            aria-label="Sketch Pencil"
            aria-pressed={color === '#2d2d2d'}
          />
        </div>

        {/* Thickness */}
        <div className="flex gap-2 justify-center text-sm font-patrick border-t-2 border-dashed border-ink/30 pt-3">
          <button
            onClick={() => setLineWidth(2)}
            className={`px-2 py-0.5 border-[2px] border-ink wobbly-sm ${lineWidth === 2 ? 'bg-ink text-white' : 'bg-white'}`}
          >
            Thin
          </button>
          <button
            onClick={() => setLineWidth(5)}
            className={`px-2 py-0.5 border-[2px] border-ink wobbly-sm ${lineWidth === 5 ? 'bg-ink text-white' : 'bg-white'}`}
          >
            Medium
          </button>
          <button
            onClick={() => setLineWidth(10)}
            className={`px-2 py-0.5 border-[2px] border-ink wobbly-sm ${lineWidth === 10 ? 'bg-ink text-white' : 'bg-white'}`}
          >
            Thick
          </button>
        </div>
      </div>
    </div>
  );
}
