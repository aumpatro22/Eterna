import { useState, useRef } from 'react';

export default function Interactive3DNotebook() {
  const [page, setPage] = useState(0); // 0: Cover/Intro, 1: Stats, 2: Interactive sketchpad
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Doodle states for the notebook page
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#2d5da1'); // Blue ink by default

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    // Calculate rotation (-15 to 15 deg max)
    const rotateX = -(mouseY / (height / 2)) * 12;
    const rotateY = (mouseX / (width / 2)) * 12;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Doodle functions for Page 3
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col items-center gap-6 my-8 select-none">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full max-w-2xl h-[380px] perspective-1000 cursor-pointer"
      >
        <div 
          className="w-full h-full preserve-3d transition-transform duration-200 ease-out"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          {/* Main Notebook Base */}
          <div className="w-full h-full bg-white border-[4px] border-ink wobbly-md shadow-hard relative overflow-hidden flex">
            
            {/* Left Page */}
            <div className="w-1/2 h-full bg-paper border-r-[2px] border-ink/30 p-6 flex flex-col justify-between relative">
              {/* Notebook Lines */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(rgba(45, 45, 45, 0.4) 1px, transparent 1px)',
                  backgroundSize: '100% 24px',
                  backgroundPosition: '0 30px',
                }}
              />
              
              {/* Spiral wire down the middle */}
              <div className="absolute right-[-8px] top-0 bottom-0 w-4 flex flex-col justify-around items-center z-20 pointer-events-none">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="w-6 h-3 bg-erased border-2 border-ink rounded-full -rotate-12" />
                ))}
              </div>

              {page === 0 && (
                <div className="relative z-10 animate-[fadeIn_0.4s_ease]">
                  <span className="font-kalam text-sm text-marker font-bold bg-postit px-2 py-0.5 rounded -rotate-2 inline-block mb-4">Volume I</span>
                  <h3 className="font-kalam text-3xl text-ink leading-tight mb-4">
                    The Sketchbook of Memory
                  </h3>
                  <p className="font-patrick text-xl text-ink/80 leading-relaxed">
                    A collaborative space built to celebrate stories. Flick through this book to learn more, or draw a memory on page 3.
                  </p>
                </div>
              )}

              {page === 1 && (
                <div className="relative z-10 animate-[fadeIn_0.4s_ease]">
                  <h3 className="font-kalam text-3xl text-ink mb-4 border-b-2 border-dashed border-ink/20 pb-2">
                    Eterna Stats
                  </h3>
                  <ul className="font-patrick text-xl flex flex-col gap-3">
                    <li>✏️ <span className="font-bold font-kalam text-marker text-2xl">50+</span> Memorial Pages</li>
                    <li>🕯️ <span className="font-bold font-kalam text-pen text-2xl">1,240+</span> Candles Lit</li>
                    <li>📓 <span className="font-bold font-kalam text-ink text-2xl">18+</span> Community Notebooks</li>
                    <li>💬 <span className="font-bold font-kalam text-marker text-2xl">320+</span> Tales Shared</li>
                  </ul>
                </div>
              )}

              {page === 2 && (
                <div className="relative z-10 animate-[fadeIn_0.4s_ease]">
                  <h3 className="font-kalam text-3xl text-ink mb-4">
                    Interactive Doodle Page
                  </h3>
                  <p className="font-patrick text-lg text-ink/80 leading-snug">
                    Draw with your mouse or finger directly on the notebook page to the right!
                  </p>
                  <div className="mt-8 flex gap-2">
                    <button 
                      onClick={clearCanvas} 
                      className="wobbly-sm bg-erased border-[3px] border-ink px-3 py-1 font-patrick font-bold text-base hover:bg-marker hover:text-white transition-colors"
                    >
                      Erase Page
                    </button>
                  </div>
                </div>
              )}

              {/* Page Number (Left) */}
              <div className="font-kalam text-sm text-ink/40 text-left mt-auto">
                page {page * 2 + 1}
              </div>
            </div>

            {/* Right Page */}
            <div className="w-1/2 h-full bg-paper p-6 flex flex-col justify-between relative">
              {/* Notebook Lines */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(rgba(45, 45, 45, 0.4) 1px, transparent 1px)',
                  backgroundSize: '100% 24px',
                  backgroundPosition: '0 30px',
                }}
              />

              {page === 0 && (
                <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4 text-center animate-[fadeIn_0.4s_ease]">
                  {/* Visual Doodle Drawing of a star/heart */}
                  <div className="w-32 h-32 border-2 border-dashed border-ink/30 flex items-center justify-center wobbly-md bg-white -rotate-3 relative group-hover:rotate-3 transition-transform">
                    <span className="text-5xl text-marker animate-pulse">❤️</span>
                  </div>
                  <span className="font-patrick text-lg text-ink/70">"Love is how you stay alive, even after you are gone."</span>
                </div>
              )}

              {page === 1 && (
                <div className="relative z-10 animate-[fadeIn_0.4s_ease]">
                  <h4 className="font-kalam text-2xl text-pen mb-4">About Eterna</h4>
                  <p className="font-patrick text-lg text-ink/80 leading-relaxed mb-4">
                    Unlike standard digital obituaries, Eterna is built like an open sketchbook. We believe memories are messy, organic, and beautiful.
                  </p>
                  <div className="bg-postit p-3 border-2 border-ink wobbly-sm -rotate-2">
                    <p className="font-kalam text-base text-ink">💡 Pro Tip: Toggle "Sketch Mode" in the Navbar to draw anywhere!</p>
                  </div>
                </div>
              )}

              {page === 2 && (
                <div className="relative z-10 h-full flex flex-col justify-between animate-[fadeIn_0.4s_ease]">
                  {/* Canvas Pad */}
                  <div className="flex-1 border-[3px] border-ink wobbly-sm bg-white overflow-hidden relative">
                    <canvas
                      ref={canvasRef}
                      width={280}
                      height={210}
                      className="absolute inset-0 w-full h-full cursor-pencil"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>

                  {/* Brush Colors */}
                  <div className="flex justify-center gap-3 mt-3">
                    <button
                      onClick={() => setColor('#2d5da1')}
                      className={`w-6 h-6 rounded-full border border-ink ${color === '#2d5da1' ? 'ring-2 ring-offset-1 ring-pen' : ''}`}
                      style={{ backgroundColor: '#2d5da1' }}
                    />
                    <button
                      onClick={() => setColor('#ff4d4d')}
                      className={`w-6 h-6 rounded-full border border-ink ${color === '#ff4d4d' ? 'ring-2 ring-offset-1 ring-marker' : ''}`}
                      style={{ backgroundColor: '#ff4d4d' }}
                    />
                    <button
                      onClick={() => setColor('#2d2d2d')}
                      className={`w-6 h-6 rounded-full border border-ink ${color === '#2d2d2d' ? 'ring-2 ring-offset-1 ring-ink' : ''}`}
                      style={{ backgroundColor: '#2d2d2d' }}
                    />
                  </div>
                </div>
              )}

              {/* Page Number (Right) */}
              <div className="font-kalam text-sm text-ink/40 text-right mt-auto flex justify-between items-center">
                <span>page {page * 2 + 2}</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Manual Page-flip Controls */}
      <div className="flex gap-4">
        <button 
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="btn btn-secondary py-2 px-4 text-base"
        >
          ◀ Previous Page
        </button>
        <button 
          onClick={() => setPage(Math.min(2, page + 1))}
          disabled={page === 2}
          className="btn btn-primary py-2 px-4 text-base"
        >
          Next Page ▶
        </button>
      </div>
    </div>
  );
}
