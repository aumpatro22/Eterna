import { useState, useRef, useEffect } from 'react';

// Frequencies for chord progression (Am7, Fmaj7, Cmaj7, G6)
const CHORDS = [
  [110.00, 130.81, 164.81, 196.00], // Am7 (A2, C3, E3, G3)
  [87.31, 110.00, 130.81, 164.81],  // Fmaj7 (F2, A2, C3, E3)
  [130.81, 196.00, 261.63, 329.63], // Cmaj7 (C3, G3, C4, E4)
  [98.00, 123.47, 146.83, 196.00],  // G6 (G2, B2, D3, G3)
];

export default function CassetteTapePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const synthNodesRef = useRef([]); // holds active oscillators/gains
  const hissNodeRef = useRef(null); // white noise node for tape hiss
  const chordIndexRef = useRef(0);
  const timerRef = useRef(null);

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, []);

  const createTapeHiss = (ctx) => {
    // Generate white noise buffer
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // Create noise source
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Create bandpass filter to shape tape hiss
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;

    // Create gain node for hiss
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.012; // very soft hiss

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    whiteNoise.start();
    hissNodeRef.current = { source: whiteNoise, gain: gainNode };
  };

  const playChord = (ctx, freqs) => {
    // Fade out previous oscillators if any
    synthNodesRef.current.forEach(({ osc, gain }) => {
      try {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
        setTimeout(() => osc.stop(), 1500);
      } catch {}
    });
    synthNodesRef.current = [];

    // Warm Low Pass filter to simulate tape sound
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 650; // low frequency cut for warmth

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.5); // soft entry

    lowpass.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Create oscillators for notes in the chord
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      // Triangle wave sounds like a soft flute/peaceful pad
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.25;

      osc.connect(oscGain);
      oscGain.connect(lowpass);
      osc.start();

      synthNodesRef.current.push({ osc, gain: masterGain });
    });
  };

  const startAmbient = () => {
    // Initialize AudioContext
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    // Create tape hiss
    createTapeHiss(ctx);

    // Initial chord
    chordIndexRef.current = 0;
    playChord(ctx, CHORDS[chordIndexRef.current]);

    // Loop chords every 5 seconds
    timerRef.current = setInterval(() => {
      chordIndexRef.current = (chordIndexRef.current + 1) % CHORDS.length;
      playChord(ctx, CHORDS[chordIndexRef.current]);
    }, 5000);
  };

  const stopAmbient = () => {
    // Stop intervals
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop synth nodes
    synthNodesRef.current.forEach(({ osc }) => {
      try {
        osc.stop();
      } catch {}
    });
    synthNodesRef.current = [];

    // Stop tape hiss
    if (hissNodeRef.current) {
      try {
        hissNodeRef.current.source.stop();
      } catch {}
      hissNodeRef.current = null;
    }

    // Close AudioContext
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopAmbient();
      setIsPlaying(false);
    } else {
      startAmbient();
      setIsPlaying(true);
    }
  };

  return (
    <div className="paper-card bg-paper p-6 rotate-[-1deg] w-full max-w-[340px] mx-auto border-[3px] border-ink wobbly-md shadow-hard relative select-none">
      <div className="absolute top-2 left-6 bg-marker text-white text-xs font-bold px-2 py-0.5 -rotate-3 border-2 border-ink wobbly-sm font-kalam">
        SOUNDTRACK
      </div>
      
      {/* Tape Body */}
      <div className="bg-[#dfd7c6] border-[3px] border-ink wobbly-sm p-4 mt-3 flex flex-col gap-3 relative shadow-inner">
        {/* Cassette Label sticker */}
        <div className="bg-white border-2 border-ink p-2 wobbly-sm text-center relative">
          <h4 className="font-kalam text-lg leading-tight select-none">Eterna Echoes</h4>
          <span className="font-patrick text-xs text-ink/40">SIDE A - Warm Ambient Pad</span>
        </div>

        {/* Cassette Reels Box */}
        <div className="bg-ink rounded p-2 flex justify-between items-center w-2/3 mx-auto relative border-2 border-ink">
          {/* Reel Left */}
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-white flex items-center justify-center relative">
            <div className={`w-8 h-8 rounded-full border border-dashed border-white flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-ink rounded-full" />
              </div>
            </div>
          </div>

          {/* Reel Right */}
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-white flex items-center justify-center relative">
            <div className={`w-8 h-8 rounded-full border border-dashed border-white flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-ink rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tape Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={togglePlayback}
          className={`btn py-2 px-6 text-lg wobbly-sm font-bold shadow-hard transition-all ${
            isPlaying ? 'bg-marker text-white rotate-1 animate-pulse' : 'bg-white hover:bg-paper'
          }`}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play Tape'}
        </button>
      </div>

      <p className="font-patrick text-center text-sm text-ink/60 mt-3 select-none">
        {isPlaying ? 'Tape spinning... Listen to the background tone.' : 'Turn on to play peaceful acoustic chords.'}
      </p>
    </div>
  );
}
