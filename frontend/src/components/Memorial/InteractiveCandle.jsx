import { useState, useRef, useEffect } from 'react';

export default function InteractiveCandle({ onLight, candlesCount }) {
  const [litBy, setLitBy] = useState('');
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState('setup'); // 'setup', 'ready', 'dragging', 'ignited', 'lit', 'submitting'
  const [isMatchDragging, setIsMatchDragging] = useState(false);
  const [matchPos, setMatchPos] = useState({ x: 0, y: 0 });
  const [matchOrigin, setMatchOrigin] = useState({ x: 0, y: 0 });

  const strikerRef = useRef(null);
  const wickRef = useRef(null);
  const areaRef = useRef(null);
  const matchRef = useRef(null);

  // Setup match position
  useEffect(() => {
    if (stage === 'ready') {
      resetMatchPosition();
    }
  }, [stage]);

  const resetMatchPosition = () => {
    setMatchPos({ x: 50, y: 150 });
    setMatchOrigin({ x: 50, y: 150 });
  };

  const startDrag = (e) => {
    if (stage !== 'ready' && stage !== 'ignited') return;
    setIsMatchDragging(true);
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    const areaRect = areaRef.current.getBoundingClientRect();
    const matchWidthOffset = 8;
    const matchHeightOffset = 40;

    setMatchPos({
      x: clientX - areaRect.left - matchWidthOffset,
      y: clientY - areaRect.top - matchHeightOffset,
    });
  };

  const onDrag = (e) => {
    if (!isMatchDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const areaRect = areaRef.current.getBoundingClientRect();
    const matchWidthOffset = 8;
    const matchHeightOffset = 40;

    const newX = clientX - areaRect.left - matchWidthOffset;
    const newY = clientY - areaRect.top - matchHeightOffset;

    setMatchPos({ x: newX, y: newY });

    // Calculate match tip viewport bounding rect directly (zero latency/render lag)
    const tipLeft = areaRect.left + newX + 4;
    const tipTop = areaRect.top + newY;
    const tipRight = tipLeft + 8;
    const tipBottom = tipTop + 12;

    // 1. Strike Box Collision
    if (stage === 'ready' && strikerRef.current) {
      const strikerRect = strikerRef.current.getBoundingClientRect();

      // Check overlap
      const overlap = !(
        tipRight < strikerRect.left ||
        tipLeft > strikerRect.right ||
        tipBottom < strikerRect.top ||
        tipTop > strikerRect.bottom
      );

      if (overlap) {
        setStage('ignited');
      }
    }

    // 2. Wick Collision
    if (stage === 'ignited' && wickRef.current) {
      const wickRect = wickRef.current.getBoundingClientRect();

      const overlap = !(
        tipRight < wickRect.left ||
        tipLeft > wickRect.right ||
        tipBottom < wickRect.top ||
        tipTop > wickRect.bottom
      );

      if (overlap) {
        setIsMatchDragging(false);
        setStage('submitting');
        triggerLight();
      }
    }
  };

  const endDrag = () => {
    setIsMatchDragging(false);
    if (stage === 'dragging') {
      setStage('ready');
      resetMatchPosition();
    } else if (stage === 'ignited') {
      // If let go of ignited match, put it back and let it extinguish
      setStage('ready');
      resetMatchPosition();
    }
  };

  const triggerLight = async () => {
    try {
      await onLight(litBy, message);
      setStage('lit');
      setLitBy('');
      setMessage('');
    } catch {
      setStage('ready');
      resetMatchPosition();
    }
  };

  return (
    <div className="paper-card p-6 rotate-2 tack-decoration relative select-none">
      <div className="text-center mb-4 border-b-[3px] border-dashed border-ink pb-4">
        <div className="text-6xl mb-2 relative inline-block">
          🕯️
          {stage === 'lit' && (
            <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 w-6 h-8 bg-marker wobbly-sm animate-flame border border-ink" />
          )}
        </div>
        <h3 className="font-kalam text-3xl">Light a Candle</h3>
        <p className="font-patrick text-xl mt-2">{candlesCount} candles lit</p>
      </div>

      {stage === 'setup' && (
        <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease]">
          <input
            className="input"
            placeholder="Your Name"
            required
            value={litBy}
            onChange={(e) => setLitBy(e.target.value)}
          />
          <input
            className="input"
            placeholder="A short prayer or word of honor"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={() => {
              if (litBy.trim()) setStage('ready');
            }}
            disabled={!litBy.trim()}
            className="btn btn-primary text-xl mt-2 disabled:opacity-50"
          >
            Prepare Matchbox 📦
          </button>
        </div>
      )}

      {(stage === 'ready' || stage === 'ignited' || stage === 'submitting') && (
        <div 
          ref={areaRef}
          onMouseMove={onDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchMove={onDrag}
          onTouchEnd={endDrag}
          className="w-full h-72 border-2 border-dashed border-ink/30 relative overflow-hidden bg-paper rounded wobbly-sm"
        >
          {/* Instructions */}
          <div className="absolute inset-x-0 top-3 text-center pointer-events-none px-4 select-none">
            <p className="font-kalam text-lg text-ink/60 leading-tight">
              {stage === 'ready' 
                ? 'Strike the match tip against the box striker!' 
                : 'Now drag the flame to the candle wick!'}
            </p>
          </div>

          {/* Candle representation */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            {/* Candle Wick */}
            <div ref={wickRef} className="w-1.5 h-6 bg-ink/70 relative z-10" />
            
            {/* Candle wax body */}
            <div className="w-14 h-24 bg-white border-[3px] border-ink wobbly-sm shadow-hard-hover flex items-center justify-center">
              <span className="font-kalam text-2xl text-ink/20 font-bold rotate-90">🕯️</span>
            </div>
          </div>

          {/* Matchbox */}
          {stage === 'ready' && (
            <div className="absolute left-6 top-20 flex flex-col gap-1 items-center">
              <span className="font-patrick text-sm font-bold text-ink">Strike Pad</span>
              <div 
                ref={strikerRef}
                className="w-14 h-8 bg-marker/80 border-[3px] border-ink rounded cursor-help shadow-hard-hover flex items-center justify-center"
              >
                <div className="w-full h-2 bg-ink/30" />
              </div>
            </div>
          )}

          {/* Match Stick */}
          <div
            ref={matchRef}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
            className={`absolute cursor-grab active:cursor-grabbing w-4 h-16 flex flex-col items-center select-none ${
              isMatchDragging ? 'scale-105' : ''
            }`}
            style={{
              left: matchPos.x,
              top: matchPos.y,
            }}
          >
            {/* Match Head */}
            <div className={`w-3 h-3 rounded-full border border-ink ${stage === 'ignited' ? 'bg-marker relative animate-pulse' : 'bg-[#a35252]'}`}>
              {/* Flame overlay if ignited */}
              {stage === 'ignited' && (
                <div className="absolute top-[-15px] left-[-4px] w-5 h-7 bg-marker wobbly-sm animate-flame border border-ink" />
              )}
            </div>
            {/* Wooden Stick */}
            <div className="w-1.5 flex-1 bg-[#d7cbb5] border-x border-b border-ink/40" />
          </div>

          {stage === 'submitting' && (
            <div className="absolute inset-0 bg-paper/60 flex items-center justify-center">
              <div className="font-kalam text-xl animate-pulse">Lighting candle... 🔥</div>
            </div>
          )}
        </div>
      )}

      {stage === 'lit' && (
        <div className="text-center py-6 animate-[fadeIn_0.5s_ease] select-none">
          <div className="text-5xl mb-4">🎉</div>
          <h4 className="font-kalam text-2xl text-marker mb-2">Candle Ignited!</h4>
          <p className="font-patrick text-lg text-ink/80 mb-6">
            Thank you for holding a warm thought of remembrance. Your flame has been added.
          </p>
          <button 
            onClick={() => setStage('setup')}
            className="btn btn-secondary py-2 px-4 text-base"
          >
            Light Another 🕯️
          </button>
        </div>
      )}
    </div>
  );
}
