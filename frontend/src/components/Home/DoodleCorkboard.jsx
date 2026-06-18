import { useState, useEffect, useRef } from 'react';

const SEED_NOTES = [
  {
    id: 'seed-1',
    type: 'text',
    content: 'Welcome to the Eterna Board! Feel free to write a note or doodle. Drag me around!',
    x: 40,
    y: 50,
    rotate: -4,
    color: 'bg-postit',
  },
  {
    id: 'seed-2',
    type: 'text',
    content: '❤️ "To live in hearts we leave behind is not to die."',
    x: 400,
    y: 80,
    rotate: 3,
    color: 'bg-paper',
  },
  {
    id: 'seed-3',
    type: 'doodle',
    content: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M 50 20 C 35 5, 5 25, 50 80 C 95 25, 65 5, 50 20 Z" fill="%23ff4d4d" stroke="%232d2d2d" stroke-width="4"/></svg>',
    x: 220,
    y: 160,
    rotate: -6,
    color: 'bg-postit',
  }
];

export default function DoodleCorkboard() {
  const [notes, setNotes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [noteType, setNoteType] = useState('text'); // 'text' or 'doodle'
  const [textInput, setTextInput] = useState('');
  const [brushColor, setBrushColor] = useState('#2d2d2d');
  const [noteColor, setNoteColor] = useState('bg-postit');

  const canvasRef = useRef(null);
  const boardRef = useRef(null);
  const dragRef = useRef(null); // stores { noteId, startX, startY, noteStartX, noteStartY }
  const [isDrawing, setIsDrawing] = useState(false);

  // Load notes
  useEffect(() => {
    const stored = localStorage.getItem('eterna_corkboard_notes');
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch {
        setNotes(SEED_NOTES);
      }
    } else {
      setNotes(SEED_NOTES);
    }
  }, []);

  const saveNotes = (updated) => {
    setNotes(updated);
    localStorage.setItem('eterna_corkboard_notes', JSON.stringify(updated));
  };

  // Drag and Drop Logic
  const handleMouseDown = (e, note) => {
    // If clicking a button inside note, don't drag
    if (e.target.tagName === 'BUTTON') return;
    
    e.preventDefault();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    dragRef.current = {
      noteId: note.id,
      startX: clientX,
      startY: clientY,
      noteStartX: note.x,
      noteStartY: note.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const deltaX = clientX - dragRef.current.startX;
    const deltaY = clientY - dragRef.current.startY;

    const boardRect = boardRef.current.getBoundingClientRect();

    const updated = notes.map((note) => {
      if (note.id === dragRef.current.noteId) {
        // Constrain to board boundaries
        let newX = dragRef.current.noteStartX + deltaX;
        let newY = dragRef.current.noteStartY + deltaY;

        newX = Math.max(0, Math.min(newX, boardRect.width - 180));
        newY = Math.max(0, Math.min(newY, boardRect.height - 180));

        return { ...note, x: newX, y: newY };
      }
      return note;
    });

    setNotes(updated);
  };

  const handleMouseUp = () => {
    if (dragRef.current) {
      saveNotes(notes);
      dragRef.current = null;
    }
  };

  // Canvas Drawing
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 4;
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

  // Add Note
  const handleAddNote = () => {
    let content = '';

    if (noteType === 'text') {
      if (!textInput.trim()) return;
      content = textInput;
      setTextInput('');
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      content = canvas.toDataURL();
      clearCanvas();
    }

    const newNote = {
      id: Math.random().toString(),
      type: noteType,
      content,
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
      rotate: Math.floor(Math.random() * 12) - 6, // Random rotation between -6 and +6 deg
      color: noteColor,
    };

    saveNotes([...notes, newNote]);
    setIsAdding(false);
  };

  const deleteNote = (id) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none my-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b-[3px] border-ink border-dashed pb-4">
        <div>
          <h2 className="font-kalam text-4xl text-ink">Community Guestboard 📌</h2>
          <p className="font-patrick text-lg text-ink/75">
            Doodle or write a memory, then pin it. Drag and drop post-its to organize the board!
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn btn-primary -rotate-1"
        >
          {isAdding ? 'Close Drawer 📂' : 'Pin a Sticky Note 📌'}
        </button>
      </div>

      {/* Note Addition Drawer */}
      {isAdding && (
        <div className="paper-card bg-paper p-6 rotate-1 max-w-lg mx-auto w-full border-[3px] border-ink shadow-hard animate-jitter">
          <h3 className="font-kalam text-2xl text-center mb-4">Craft a Memo</h3>
          
          {/* Note Type Selector */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => setNoteType('text')}
              className={`px-4 py-2 border-[2px] border-ink font-patrick font-bold text-lg wobbly-sm ${noteType === 'text' ? 'bg-ink text-white' : 'bg-white text-ink'}`}
            >
              Write Text
            </button>
            <button
              onClick={() => setNoteType('doodle')}
              className={`px-4 py-2 border-[2px] border-ink font-patrick font-bold text-lg wobbly-sm ${noteType === 'doodle' ? 'bg-ink text-white' : 'bg-white text-ink'}`}
            >
              Draw Doodle
            </button>
          </div>

          {/* Color Select */}
          <div className="flex justify-center gap-3 mb-6">
            <span className="font-patrick font-bold text-lg mr-2 self-center">Paper Color:</span>
            {['bg-postit', 'bg-white', 'bg-erased'].map((col) => (
              <button
                key={col}
                onClick={() => setNoteColor(col)}
                className={`w-6 h-6 border-[2px] border-ink rounded-full ${col} ${noteColor === col ? 'ring-2 ring-ink ring-offset-1' : ''}`}
              />
            ))}
          </div>

          {/* Form Content */}
          {noteType === 'text' ? (
            <textarea
              className="input h-28 w-full p-3 mb-4 text-ink font-patrick text-lg"
              placeholder="Type your memory or message here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="border-[3px] border-ink wobbly-sm bg-white overflow-hidden relative" style={{ width: 280, height: 180 }}>
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={180}
                  className="absolute inset-0 cursor-pencil bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <div className="flex justify-between w-full max-w-[280px]">
                <div className="flex gap-2">
                  {['#2d2d2d', '#ff4d4d', '#2d5da1'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setBrushColor(c)}
                      className={`w-6 h-6 rounded-full border border-ink ${brushColor === c ? 'ring-2 ring-offset-1 ring-ink' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button 
                  onClick={clearCanvas}
                  className="font-patrick font-bold text-marker text-sm underline"
                >
                  Clear Screen
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAddNote}
            className="btn btn-primary w-full text-xl py-3 mt-2"
          >
            Pin to Board 📌
          </button>
        </div>
      )}

      {/* Board Container */}
      <div 
        ref={boardRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className="w-full h-[500px] border-[4px] border-ink wobbly-md bg-paper relative overflow-hidden shadow-hard"
        style={{
          backgroundImage: 'radial-gradient(#e5e0d8 2px, transparent 2px)',
          backgroundSize: '30px 30px',
        }}
      >
        {/* Corkboard Background Accent */}
        <div className="absolute inset-0 bg-[#b58f62]/5 pointer-events-none" />

        {notes.map((note) => (
          <div
            key={note.id}
            onMouseDown={(e) => handleMouseDown(e, note)}
            onTouchStart={(e) => handleMouseDown(e, note)}
            className={`absolute w-44 p-4 border-[3px] border-ink wobbly-sm shadow-hard transition-transform duration-75 select-none ${note.color}`}
            style={{
              left: note.x,
              top: note.y,
              transform: `rotate(${note.rotate}deg)`,
              cursor: 'grab',
            }}
          >
            {/* Red Thumbtack Pin */}
            <div className="absolute top-[-8px] left-1/2 transform -translateX-1/2 w-4 h-4 bg-marker border-2 border-ink rounded-full shadow-[1px_2px_0_rgba(0,0,0,0.3)] z-10 pointer-events-none" />
            
            {/* Delete button (only visible on hover/tap) */}
            <button
              onClick={() => deleteNote(note.id)}
              className="absolute top-1 right-2 font-kalam text-xs text-ink/30 hover:text-marker font-bold"
              title="Unpin Note"
            >
              x
            </button>

            {/* Content Display */}
            <div className="pt-2 pb-1 overflow-hidden select-none pointer-events-none">
              {note.type === 'text' ? (
                <p className="font-patrick text-base text-ink leading-snug break-words">
                  {note.content}
                </p>
              ) : (
                <img 
                  src={note.content} 
                  alt="Doodle Note" 
                  className="w-full object-contain pointer-events-none select-none max-h-24"
                />
              )}
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-kalam text-2xl text-ink/30">The guestboard is completely empty... Pin a note!</span>
          </div>
        )}
      </div>
    </div>
  );
}
