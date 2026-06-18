import { useEffect, useState, useRef } from 'react';

const MEMORY_QUOTES = [
  "\"The best thing about memories is making them.\" - Keep drawing your story.",
  "\"Every life is a book with chapters untold.\" - Scribble down a tale before you go.",
  "\"What is once loved, is never lost.\" - Light a candle for a loved one today.",
  "\"A memory is a photograph taken by the heart.\" - Share yours with the community.",
  "Remember that time you laughed until you cried? Hold on to that feeling today.",
  "No story is too small to be recorded. What story will you tell next?",
];

export default function ExitIntentHook() {
  const [show, setShow] = useState(false);
  const [torn, setTorn] = useState(false);
  const [quote, setQuote] = useState('');
  const [dragProgress, setDragProgress] = useState(0); // 0 to 100%
  const isDragging = useRef(false);
  const startY = useRef(0);

  useEffect(() => {
    // Avoid showing multiple times in the same session
    const hasSeen = sessionStorage.getItem('eterna_seen_exit');
    if (hasSeen) return;

    const handleMouseLeave = (e) => {
      // Check if mouse left the top of the viewport (indicating tab/URL bar transition)
      if (e.clientY <= 5) {
        setQuote(MEMORY_QUOTES[Math.floor(Math.random() * MEMORY_QUOTES.length)]);
        setShow(true);
        sessionStorage.setItem('eterna_seen_exit', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const startTear = (e) => {
    isDragging.current = true;
    startY.current = e.clientY || (e.touches && e.touches[0].clientY);
  };

  const moveTear = (e) => {
    if (!isDragging.current || torn) return;
    const currentY = e.clientY || (e.touches && e.touches[0].clientY);
    const deltaY = currentY - startY.current;

    if (deltaY > 0) {
      const progress = Math.min(100, (deltaY / 150) * 100);
      setDragProgress(progress);
      if (progress >= 95) {
        setTorn(true);
        setDragProgress(100);
        isDragging.current = false;
      }
    }
  };

  const endTear = () => {
    isDragging.current = false;
    if (!torn) {
      setDragProgress(0); // Reset if let go early
    }
  };

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-ink/60 z-[99999] flex items-center justify-center p-6 backdrop-blur-[2px] transition-all"
      onMouseMove={moveTear}
      onMouseUp={endTear}
      onTouchMove={moveTear}
      onTouchEnd={endTear}
    >
      <div className="paper-card bg-postit p-8 max-w-lg w-full text-center relative rotate-1 tack-decoration shadow-hard animate-jitter select-none">
        
        {/* Close Button */}
        <button 
          onClick={() => setShow(false)} 
          className="absolute top-4 right-4 font-kalam text-3xl hover:text-marker transition-colors"
          title="Close note"
        >
          ✖
        </button>

        <h3 className="font-kalam text-4xl text-marker mb-4">Wait! Don't turn the page yet...</h3>
        <p className="font-patrick text-xl mb-6 text-ink/80">
          Before you close Eterna, tear off this memory strip to take an inspiring thought with you.
        </p>

        {/* The Paper Strip to Tear */}
        <div className="relative mx-auto my-8 max-w-[300px] select-none">
          {!torn ? (
            <div 
              className="bg-white border-[3px] border-ink wobbly-sm shadow-hard relative overflow-hidden transition-all duration-75"
              style={{
                transform: `translateY(${dragProgress * 0.2}px) rotate(${dragProgress * 0.05}deg)`,
              }}
            >
              {/* Card top half */}
              <div className="p-4 bg-paper border-b-[3px] border-dashed border-ink/40 relative">
                <span className="font-kalam text-lg text-ink/40">ETERNA SLIP</span>
                {/* Tear line label */}
                <div className="absolute left-0 right-0 -bottom-3 text-xs font-bold text-marker tracking-widest animate-pulse pointer-events-none">
                  - - - - DRAG DOWN TO TEAR - - - -
                </div>
              </div>

              {/* Card draggable handle */}
              <div 
                onMouseDown={startTear}
                onTouchStart={startTear}
                className="p-8 cursor-grab active:cursor-grabbing bg-white hover:bg-paper select-none flex flex-col items-center justify-center"
              >
                <div className="text-4xl animate-bounce mb-2">👇</div>
                <span className="font-patrick text-lg font-bold text-ink">Grab and Pull Down</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-[bounce_0.6s_ease-out]">
              {/* Torn Top half flying up */}
              <div className="bg-paper border-[3px] border-ink border-dashed wobbly-sm p-4 opacity-50 -rotate-3 translate-y-[-10px] transition-transform">
                <span className="font-kalam text-lg text-ink/30">ETERNA SLIP</span>
              </div>
              
              {/* Revealed message inside torn piece */}
              <div className="bg-white border-[3px] border-marker wobbly-md p-6 rotate-2 shadow-hard animate-pulse relative">
                <div className="absolute -top-3 left-6 bg-marker text-white text-xs font-bold px-2 py-0.5 -rotate-6">
                  YOUR FORTUNE
                </div>
                <p className="font-kalam text-xl text-ink leading-relaxed">
                  {quote}
                </p>
                <button 
                  onClick={() => setShow(false)}
                  className="btn btn-secondary mt-6 py-2 px-4 text-base"
                >
                  Okay, stay a while! ❤️
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
