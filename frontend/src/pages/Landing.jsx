import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { useInView } from 'react-intersection-observer';
import Lenis from 'lenis';
import { useAuth } from '../contexts/AuthContext';

/* ─── Pressed Flower Decorative Vector ──────────────────────── */
const PressedFlower = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M50 85 C52 68 48 52 50 32" stroke="#8c9a6b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M50 68 C40 65 35 57 38 54 C41 51 46 57 50 62" fill="#7a8a59" opacity="0.7" />
    <path d="M50 52 C60 50 65 42 62 39 C59 36 54 44 50 49" fill="#7a8a59" opacity="0.7" />
    <circle cx="50" cy="27" r="7" fill="#dfb15b" opacity="0.85" />
    <path d="M50 20 C46 12 54 12 50 20 Z" fill="#e8c2ca" opacity="0.7" />
    <path d="M50 34 C46 42 54 42 50 34 Z" fill="#e8c2ca" opacity="0.7" />
    <path d="M43 27 C35 23 35 31 43 27 Z" fill="#e8c2ca" opacity="0.7" />
    <path d="M57 27 C65 23 65 31 57 27 Z" fill="#e8c2ca" opacity="0.7" />
    <path d="M45 22 C38 16 43 11 47 17 Z" fill="#e8c2ca" opacity="0.7" />
    <path d="M55 32 C62 38 57 43 53 37 Z" fill="#e8c2ca" opacity="0.7" />
    <path d="M45 32 C38 38 33 33 39 29 Z" fill="#e8c2ca" opacity="0.7" />
    <path d="M55 22 C62 16 67 21 61 25 Z" fill="#e8c2ca" opacity="0.7" />
  </svg>
);

/* ─── Hand-Drawn Sketch Arrow ─────────────────────────────── */
const HandDrawnArrow = ({ className }) => (
  <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path 
      d="M5 22 C25 24 55 12 90 14" 
      stroke="#2d2d2d" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />
    <path 
      d="M78 6 C81 11 86 14 91 15 C85 18 82 25 80 30" 
      stroke="#2d2d2d" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />
  </svg>
);

/* ─── Ink Splash Doodle ───────────────────────────────────── */
const InkSplash = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M50 50 C40 45 42 35 48 30 C54 25 62 28 65 35 C68 42 60 48 55 52 C50 56 46 62 42 66 C38 70 30 72 28 65 C26 58 35 55 50 50 Z" fill="#2d2d2d" opacity="0.1" />
    <circle cx="35" cy="30" r="3" fill="#2d2d2d" opacity="0.1" />
    <circle cx="68" cy="62" r="2.5" fill="#2d2d2d" opacity="0.1" />
    <circle cx="55" cy="72" r="1.5" fill="#2d2d2d" opacity="0.1" />
  </svg>
);

/* ─── Scroll-Triggered Text Highlight ─────────────────────── */
function HighlightText({ children }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.6 });
  return (
    <span ref={ref} className={`marker-highlight ${inView ? 'highlight-active' : ''}`}>
      {children}
    </span>
  );
}

/* ─── Magnetic Hover CTA Button ───────────────────────────── */
function MagneticButton({ children, to, className, style }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 15, stiffness: 150 });
  const springY = useSpring(y, { damping: 15, stiffness: 150 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const clientX = e.clientX - (rect.left + width / 2);
    const clientY = e.clientY - (rect.top + height / 2);
    x.set(clientX * 0.35);
    y.set(clientY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <Link to={to} className={className} style={style}>
        {children}
      </Link>
    </motion.div>
  );
}

/* ─── Section Header (Consistent Scrapbook Label) ──────────── */
function SectionTitle({ label, title, subtitle }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  return (
    <div ref={ref} className="text-center mb-16 relative">
      {label && (
        <span className="inline-block bg-postit text-ink border-[2px] border-ink px-4 py-1 font-kalam text-sm rotate-2 shadow-hard mb-4">
          {label}
        </span>
      )}
      <h2 className="font-kalam text-4xl md:text-5xl lg:text-6xl text-ink leading-tight font-bold">
        {title}
      </h2>
      {subtitle && (
        <p className="font-patrick text-xl md:text-2xl text-ink/70 mt-3 max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── Floating Paper Scrap Decoration ──────────────────────── */
function FloatingScrap({ children, rotate = 0, delay = 0, top, left, right, bottom, color = 'bg-postit' }) {
  return (
    <div
      className={`absolute hidden lg:block ${color} border-[2px] border-ink px-4 py-2 font-kalam text-sm shadow-hard pointer-events-none select-none`}
      style={{
        top, left, right, bottom,
        transform: `rotate(${rotate}deg)`,
        animation: `float-scrap 5s ease-in-out ${delay}s infinite alternate`,
        borderRadius: '12px 24px 12px 24px / 24px 12px 24px 12px',
        zIndex: 1,
      }}
    >
      {children}
    </div>
  );
}

/* ─── CountUp Counter ──────────────────────────────────────── */
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Landing() {
  const { user } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);

  /* Setup Lenis scroll + scroll progress tracking */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /* Mouse move tracker for custom desktop cursor pointer */
  useEffect(() => {
    const updateMouse = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, .cursor-pointer, input, textarea, select');
      setIsHoveringClickable(!!target);
    };

    window.addEventListener('mousemove', updateMouse);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', updateMouse);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  /* Typewriter headline hook */
  const phrases = [
    "Before memories become regrets.",
    "Every life is a story.",
    "Some voices deserve forever.",
    "Because nobody should disappear twice."
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [cursorBlink, setCursorBlink] = useState(true);

  useEffect(() => {
    const target = phrases[phraseIdx];
    let timeout;
    if (!deleting && displayed.length < target.length) {
      timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === target.length) {
      timeout = setTimeout(() => setDeleting(true), 2400);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, phraseIdx]);

  useEffect(() => {
    const t = setInterval(() => setCursorBlink(b => !b), 500);
    return () => clearInterval(t);
  }, []);

  /* Scrollytelling hook for Sarah's story */
  const [storyRef, storyVisible] = useVisibleObserver(0.2);

  /* Stats Intersection Observer */
  const { ref: statsInViewRef, inView: statsInView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const memCount = useCountUp(1280, 2000, statsInView);
  const storiesCount = useCountUp(8420, 2200, statsInView);
  const familiesCount = useCountUp(348, 1800, statsInView);

  /* Cassette player play simulation state */
  const [isCassettePlaying, setIsCassettePlaying] = useState(false);
  const [cassetteTime, setCassetteTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isCassettePlaying) {
      interval = setInterval(() => {
        setCassetteTime(t => {
          if (t >= 14) {
            setIsCassettePlaying(false);
            return 0;
          }
          return t + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isCassettePlaying]);

  return (
    <div className="flex flex-col gap-0 overflow-x-hidden relative min-h-screen selection:bg-postit/80 lg:cursor-none">
      
      {/* Scroll progress bar */}
      <div 
        className="fixed top-0 left-0 h-[6px] bg-marker z-[10000] transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Ambient noise & grain filter */}
      <div className="bg-grain" />

      {/* Custom hand-drawn pencil cursor (desktop only) */}
      <div 
        className="fixed pointer-events-none z-[99999] hidden lg:block"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          transform: `translate(-5px, -20px) scale(${isHoveringClickable ? 1.25 : 1})`,
          transition: 'transform 0.15s cubic-bezier(0.165, 0.84, 0.44, 1)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path 
            d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25Z" 
            fill="#2d2d2d" 
            stroke="#fdfbf7" 
            strokeWidth="1.5"
          />
          <path 
            d="M20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" 
            fill="#ff4d4d" 
            stroke="#fdfbf7" 
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Inline animations style tag */}
      <style>{`
        @keyframes float-scrap {
          from { transform: translateY(0px) rotate(var(--r, 0deg)); }
          to   { transform: translateY(-16px) rotate(var(--r, 0deg)); }
        }
        @keyframes pulse-shadow {
          0%, 100% { box-shadow: 4px 4px 0px #2d2d2d; }
          50% { box-shadow: 8px 8px 0px #2d2d2d; }
        }
        .btn-pulse {
          animation: pulse-shadow 2s infinite ease-in-out;
        }
        .bg-ruled-paper {
          background-size: 100% 28px;
          background-image: linear-gradient(transparent 27px, #e5e0d8 27px);
        }
      `}</style>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO
         ══════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
        
        {/* Floating background scraps & flowers */}
        <FloatingScrap top="12%" left="4%" rotate={-6} delay={0}>🌸 Elena's Lilacs</FloatingScrap>
        <FloatingScrap top="10%" right="6%" rotate={8} delay={0.6} color="bg-white">🎙️ audio_grandma_1998.wav</FloatingScrap>
        <FloatingScrap bottom="15%" left="6%" rotate={4} delay={1.2} color="bg-erased">🍂 Pressed Maple Leaf</FloatingScrap>
        <FloatingScrap bottom="18%" right="4%" rotate={-7} delay={0.8}>📖 Chapter 4: The Homestead</FloatingScrap>

        {/* Vintage pressed flower vector on left side */}
        <PressedFlower className="absolute left-[3%] top-[35%] w-24 h-48 opacity-15 hidden xl:block pointer-events-none select-none" />
        {/* Ink splash background doodle */}
        <InkSplash className="absolute right-[5%] bottom-[12%] w-44 h-44 pointer-events-none select-none" />

        <div className="relative z-10 max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero text */}
          <div className="flex flex-col gap-6 text-left">
            <div>
              <span className="inline-block bg-marker text-white font-kalam px-4 py-1 text-sm -rotate-2 shadow-hard border-[2px] border-ink">
                ✨ A place for memory, not metrics
              </span>
            </div>

            <h1 className="font-kalam text-5xl md:text-6xl lg:text-7xl leading-[1.1] font-bold text-ink min-h-[2.8em] lg:min-h-[2.4em]">
              <span className="text-marker block mb-2">Eterna</span>
              <span>{displayed}</span>
              <span
                className="inline-block w-[3px] h-[0.95em] align-middle bg-ink ml-1"
                style={{ opacity: cursorBlink ? 1 : 0 }}
              />
            </h1>

            <p className="font-patrick text-xl md:text-2xl text-ink/80 leading-relaxed max-w-lg">
              A living scrapbook of heritage where families preserve their loved ones' stories, share heartfelt memories, and connect with others who understand.
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <MagneticButton 
                to={user ? "/memorials/create" : "/register"} 
                className="btn btn-primary btn-pulse text-xl -rotate-1 bg-marker text-white hover:bg-marker/90 font-kalam font-bold px-8 py-4"
              >
                Create a Memorial — Free ❤️
              </MagneticButton>
              <a 
                href="#why-i-built" 
                className="btn btn-secondary text-xl rotate-1 font-kalam font-bold px-8 py-4"
              >
                See How It Works
              </a>
            </div>

            <p className="font-patrick text-sm text-ink/50 mt-1">
              No follower counts. No likes. No advertisements. Just pure stories.
            </p>
          </div>

          {/* Interactive notebook tilt (Right side) */}
          <div className="flex justify-center items-center">
            <Tilt
              perspective={1000}
              scale={1.03}
              className="preserve-3d cursor-grab active:cursor-grabbing"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div 
                className="relative bg-white border-[4px] border-ink shadow-hard-lg p-6 w-80 md:w-96 preserve-3d"
                style={{ 
                  borderRadius: '12px 30px 12px 30px / 30px 12px 30px 12px',
                  transform: 'translateZ(30px)' 
                }}
              >
                {/* Spiral notebook rings */}
                <div className="absolute left-0 inset-y-0 w-6 bg-marker border-r-[4px] border-ink rounded-l-lg" />
                <div className="absolute left-2.5 inset-y-0 flex flex-col justify-around py-5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 rounded-full bg-white border-[2.5px] border-ink shadow-sm" />
                  ))}
                </div>

                {/* Notebook sheet clip decoration */}
                <div className="paper-clip" />

                <div className="pl-8 flex flex-col gap-5">
                  <div className="text-center border-b-[2px] border-dashed border-ink/30 pb-3">
                    <p className="font-kalam text-3xl font-bold">In Loving Memory</p>
                    <p className="font-patrick text-base text-ink/65 mt-1">of our beloved family patriarch</p>
                  </div>

                  {/* Polaroid Frame */}
                  <div className="bg-white border-[3px] border-ink p-3 pb-6 shadow-hard rotate-2 self-center w-48 polaroid-shine">
                    <div className="bg-[#f0ece3] h-36 flex items-center justify-center relative">
                      <span className="text-6xl select-none">👴</span>
                      <div className="absolute top-2 right-2 text-xs font-kalam bg-white/70 border border-ink px-1 -rotate-6">Elena's Photo</div>
                    </div>
                    <p className="font-kalam text-center text-lg mt-3 text-ink font-bold leading-none">James Arthur</p>
                    <p className="font-patrick text-center text-sm text-ink/60 mt-1">1941 — 2023</p>
                  </div>

                  {/* Handwritten lines */}
                  <div className="flex flex-col gap-2 font-patrick text-base text-ink/90 italic pl-1 pr-1 bg-ruled-paper pt-1">
                    <p>“He always brought wild lilacs…”</p>
                    <p>“Every Sunday morning at dawn…”</p>
                    <p>“His deep laughter filled the garden…”</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs font-patrick bg-postit border border-ink px-2.5 py-0.5 rotate-1 shadow-sm font-bold">🏷️ Lost Father</span>
                    <span className="text-xs font-patrick bg-white border border-ink px-2.5 py-0.5 -rotate-2 shadow-sm font-bold">🌸 Lost Grandpa</span>
                  </div>
                </div>
              </div>
            </Tilt>
          </div>

        </div>

        {/* Scroll hint indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce select-none pointer-events-none">
          <span className="font-kalam text-xs text-ink/40">Scroll to explore</span>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ink/35" aria-hidden="true">
            <path d="M11 4v14M5 12l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — WHY I BUILT ETERNA
         ══════════════════════════════════════════ */}
      <section id="why-i-built" className="relative py-24 px-6 overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute left-[8%] bottom-[10%] border-[2px] border-ink bg-white p-2 shadow-hard rotate-6 hidden md:block select-none pointer-events-none">
          <div className="bg-[#f0ece3] w-20 h-20 flex items-center justify-center text-4xl">🌻</div>
        </div>

        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="bg-white border-[3px] border-ink p-10 md:p-14 shadow-hard-lg masking-tape relative w-full"
            style={{ borderRadius: '15px 35px 15px 35px / 35px 15px 35px 15px' }}
          >
            {/* Coffee stain ring behind the text */}
            <div className="coffee-stain absolute inset-0 opacity-40 z-0 bg-[position:bottom_right_10%] bg-[size:160px_160px]" />

            <div className="relative z-10 flex flex-col gap-6 text-left">
              <h3 className="font-kalam text-3xl font-bold text-marker underline decoration-wavy decoration-ink/20 pb-2">
                Why Eterna was built.
              </h3>
              
              <div className="font-kalam text-2xl md:text-3xl text-ink leading-relaxed space-y-4">
                <p className="line-through decoration-[3px] decoration-marker/45">Photos stay inside phones.</p>
                <p className="line-through decoration-[3px] decoration-marker/45">Stories disappear.</p>
                <p className="line-through decoration-[3px] decoration-marker/45">Voices fade.</p>
                <p className="font-bold pt-4 font-patrick text-3xl text-ink/95 leading-normal">
                  "I built Eterna because memories deserve a home."
                </p>
              </div>

              <div className="flex justify-end items-center gap-2 mt-6 border-t-[2.5px] border-dashed border-ink/25 pt-6">
                <span className="font-kalam text-xl font-bold text-ink/70">— Aum, Founder</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — SARAH'S STORY (Scrollytelling)
         ══════════════════════════════════════════ */}
      <section ref={storyRef} className="relative bg-postit border-y-[4px] border-ink py-28 px-6 overflow-hidden">
        {/* Lined paper lines background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 33px, #2d2d2d 33px, #2d2d2d 34px)',
            backgroundSize: '100% 34px',
          }}
        />

        <div className="relative max-w-4xl mx-auto flex flex-col gap-10">
          <SectionTitle 
            label="📜 A living memory example" 
            title="The Unfolding of Sarah's Story" 
            subtitle="How a simple catalog page bridged families across three continents."
          />

          <div className="grid md:grid-cols-12 gap-8 items-center mt-6">
            
            {/* Story cards stack */}
            <div className="md:col-span-7 flex flex-col gap-6 font-patrick text-xl md:text-2xl text-ink leading-relaxed text-left bg-white border-[3px] border-ink p-8 shadow-hard relative">
              <div className="paper-clip" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={1}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4"
                >
                  <p>Sarah had hundreds of photos of her grandmother Elena in folders on her computer.</p>
                  <p className="text-ink/70">But nobody remembered the stories behind them. The voices were fading, and the locations were lost.</p>
                  <p>She invited her cousins on a private Eterna memorial. One memory led to ten. Family members recalled events and places Elena lived in the 60s.</p>
                  <p>One memory became conversations. Conversations became phone calls.</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Visual focus (Grandma polaroid + friends) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative">
              <PressedFlower className="absolute right-[-10%] top-[-20%] w-16 h-36 opacity-30 select-none pointer-events-none" />
              
              <motion.div 
                className="bg-white border-[3px] border-ink p-4 shadow-hard -rotate-3 hover:rotate-0 transition-transform duration-300 polaroid-shine max-w-[200px]"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-[#f0ece3] w-40 h-40 flex items-center justify-center font-kalam text-5xl">👵</div>
                <p className="font-kalam text-center mt-3 text-sm font-bold">Grandma Elena</p>
              </motion.div>

              <HandDrawnArrow className="w-24 h-12 mt-6 rotate-12 stroke-[#2d2d2d]" />
            </div>

          </div>

          <div className="text-center mt-12 bg-white border-[3px] border-ink p-8 shadow-hard-lg rotate-1 max-w-2xl mx-auto w-full">
            <h3 className="font-kalam text-3xl md:text-4xl leading-normal font-bold">
              And eventually...<br/>
              <span className="text-4xl md:text-5xl block mt-2 text-marker">
                <HighlightText>THEY BECAME FRIENDS AGAIN ❤️</HighlightText>
              </span>
            </h3>
            <p className="font-patrick text-lg text-ink/60 mt-3">The memorial was the beginning, not the destination.</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — HOW MEMORIES COME ALIVE
         ══════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionTitle 
            label="✏️ how it works" 
            title="How Memories Come Alive" 
            subtitle="Eterna gathers family members into a safe harbor where legacies stay intact."
          />

          <motion.div 
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { num: "1", title: "Create a Memorial", desc: "Build a permanent digital journal for your loved one with their biography, dates, and milestones.", rot: -1.5 },
              { num: "2", title: "Add Memories", desc: "Attach notes, photographs, or audio records of shared moments. Organise them on the timeline.", rot: 1 },
              { num: "3", title: "Invite Family", desc: "Co-author stories. Cousins and friends join to contribute their own perspectives and pictures.", rot: -1 },
              { num: "4", title: "Keep Stories Alive", desc: "Create connection tags and discover other families who understand similar life journeys.", rot: 1.5 },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 35 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                }}
                whileHover={{ y: -8, scale: 1.02, rotate: 0 }}
                className="paper-card p-6 flex flex-col gap-4 text-left"
                style={{ transform: `rotate(${step.rot}deg)` }}
              >
                <div className="w-12 h-12 rounded-full border-[3px] border-ink bg-marker text-white font-kalam text-xl flex items-center justify-center shadow-hard select-none">
                  {step.num}
                </div>
                <h4 className="font-kalam text-xl font-bold mt-2">{step.title}</h4>
                <p className="font-patrick text-base text-ink/75 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — WHO IS ETERNA FOR?
         ══════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-erased border-y-[4px] border-ink relative overflow-hidden">
        
        {/* Background dried leaf drawing */}
        <div className="absolute right-[4%] top-[10%] w-24 h-48 opacity-10 pointer-events-none select-none">🍂</div>

        <div className="max-w-5xl mx-auto">
          <SectionTitle 
            label="❤️ Who is Eterna for?" 
            title="Designed for Deep Human Experience" 
            subtitle="Not for influencers, followers, or viral loops. Made for genuine preservation."
          />

          <div className="grid md:grid-cols-3 gap-10 mt-12 items-center">
            {[
              {
                title: "Family Stories",
                emoji: "📚",
                desc: "Write down the stories told at dinner tables, trace ancestry milestones, and pass legacy memories down through clean digital scrapbooks.",
                rot: -2,
                color: "bg-white",
              },
              {
                title: "Grief & Remembrance",
                emoji: "🕊️",
                desc: "A soft harbor to light candles, view timeline milestones, and leave guestbook thoughts on birthdays, anniversaries, and anniversaries of passing.",
                rot: 1.5,
                color: "bg-postit",
              },
              {
                title: "Legacy Preservation",
                emoji: "⚓",
                desc: "Anchor your own story. Decide how your biography, values, and memories will be remembered by the next generation, completely under your privacy control.",
                rot: -1,
                color: "bg-white",
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 90, delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02, rotate: 0 }}
                className={`${card.color} border-[3px] border-ink p-8 shadow-hard relative`}
                style={{ 
                  borderRadius: '15px 30px 15px 30px / 30px 15px 30px 15px',
                  transform: `rotate(${card.rot}deg)` 
                }}
              >
                <div className="paper-clip" />
                <div className="text-5xl mb-4 select-none">{card.emoji}</div>
                <h4 className="font-kalam text-2xl font-bold mb-3">{card.title}</h4>
                <p className="font-patrick text-lg text-ink/80 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6 — EVERYTHING YOU NEED
         ══════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionTitle 
            label="🛠️ complete capabilities" 
            title="Everything You Need" 
            subtitle="Built with empathy and visual warmth, avoiding generic software templates."
          />

          <motion.div 
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: "🖼️", title: "Polaroid Photo Albums", desc: "Upload and display family photos in wobbly-framed polaroid grids with handwritten captions.", rot: -1.5 },
              { icon: "⏳", title: "Life Timeline Milestones", desc: "Organise births, travels, weddings, and key accomplishments on a beautiful chronological vertical timeline.", rot: 1 },
              { icon: "🎙️", title: "Voice Notes & Audio", desc: "Attach sound records to memories. Preserve the warmth of their voice, laughter, and greetings.", rot: -0.5 },
              { icon: "🔒", title: "Your Memories, Your Choice", desc: "Granular privacy control. Set every memory or memorial to Public, Family Only, or Private.", rot: 0.8 },
              { icon: "📬", title: "Heartfelt Guestbook", desc: "Enable friends to sign notes of condolences and love. Absolutely no likes, counts, or reactions.", rot: -1.2 },
              { icon: "🏷️", title: "Experience Tags", desc: "Connect with families on similar paths (e.g. Lost Father, Caregiver) to share support.", rot: 1.5 },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 25 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -8, scale: 1.02, rotate: 0 }}
                className="paper-card p-6 flex flex-col gap-3 text-left"
                style={{ transform: `rotate(${feature.rot}deg)` }}
              >
                <div className="text-4xl select-none">{feature.icon}</div>
                <h4 className="font-kalam text-xl font-bold mt-1">{feature.title}</h4>
                <p className="font-patrick text-base text-ink/75 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 7 — GRANDMA'S VOICE (Interactive Cassette)
         ══════════════════════════════════════════ */}
      <section className="relative py-24 px-6 bg-white border-y-[4px] border-ink overflow-hidden">
        
        {/* Background dried branch decoration */}
        <PressedFlower className="absolute left-[2%] top-[10%] w-24 h-48 opacity-10 pointer-events-none select-none" />

        <div className="max-w-4xl mx-auto grid md:grid-cols-12 gap-10 items-center">
          
          {/* Handwritten description */}
          <div className="md:col-span-5 flex flex-col gap-4 text-left">
            <span className="inline-block bg-marker text-white font-kalam px-3 py-0.5 text-xs rotate-2 shadow-hard border-[2px] border-ink w-fit">
              📼 Vintage audio player
            </span>
            <h3 className="font-kalam text-3xl md:text-4xl font-bold text-ink leading-tight">
              Grandma's Voice
            </h3>
            <p className="font-patrick text-lg text-ink/80 leading-relaxed">
              Hearing a loved one's voice, laughter, or greeting is our most valuable link to the past.
            </p>
            <div className="border-l-4 border-marker pl-4 italic font-patrick text-lg text-ink/65 my-2">
              "Sometimes voices become our most precious memories."
            </div>
          </div>

          {/* Interactive Cassette Box */}
          <div className="md:col-span-7 flex flex-col items-center justify-center">
            <div 
              className="bg-[#e5e0d8] border-[3px] border-ink p-6 shadow-hard rotate-1 w-full max-w-md relative"
              style={{ borderRadius: '12px 24px 12px 24px / 24px 12px 24px 12px' }}
            >
              <div className="paper-clip" />

              {/* Cassette Header */}
              <div className="text-center font-kalam text-xl font-bold border-b-2 border-dashed border-ink/20 pb-2 mb-4 flex justify-between items-center">
                <span>Side A</span>
                <span className="text-marker">▶ Grandma's Voice</span>
                <span>00:{cassetteTime < 10 ? `0${cassetteTime}` : cassetteTime}</span>
              </div>

              {/* The Cassette Body Graphic */}
              <div className="bg-[#2d2d2d] border-[3px] border-ink rounded-lg p-4 flex flex-col gap-3 relative overflow-hidden">
                <div className="flex justify-between items-center px-4">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#fdfbf7]" />
                  <div className="flex-1 mx-4 h-6 bg-[#fff9c4] border-2 border-ink text-ink font-patrick text-xs flex items-center justify-center font-bold">
                    "Good morning beta..."
                  </div>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#fdfbf7]" />
                </div>

                {/* Cassette Reels */}
                <div className="flex justify-around items-center py-2 relative">
                  {/* Left reel */}
                  <div className="w-14 h-14 rounded-full border-4 border-ink bg-[#fdfbf7] flex items-center justify-center relative">
                    <div className={`w-8 h-8 rounded-full border-[3px] border-dashed border-ink flex items-center justify-center ${isCassettePlaying ? 'animate-spin-slow' : ''}`}>
                      <div className="w-3 h-3 rounded-full bg-ink" />
                    </div>
                  </div>
                  {/* Right reel */}
                  <div className="w-14 h-14 rounded-full border-4 border-ink bg-[#fdfbf7] flex items-center justify-center relative">
                    <div className={`w-8 h-8 rounded-full border-[3px] border-dashed border-ink flex items-center justify-center ${isCassettePlaying ? 'animate-spin-slow' : ''}`}>
                      <div className="w-3 h-3 rounded-full bg-ink" />
                    </div>
                  </div>
                </div>

                {/* Sound waves / Audio visualizer */}
                <div className="h-6 flex justify-center items-end gap-1.5 px-4 bg-[#e5e0d8]/10 rounded border border-ink/20 py-1">
                  {Array.from({ length: 16 }).map((_, idx) => {
                    const randomHeight = isCassettePlaying ? Math.random() * 100 : 15;
                    return (
                      <div 
                        key={idx}
                        className="w-1.5 bg-[#fff9c4] border border-ink/40 transition-all duration-300"
                        style={{ height: `${Math.max(10, randomHeight)}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Tape controls */}
              <div className="flex justify-center gap-4 mt-5">
                <button
                  onClick={() => setIsCassettePlaying(!isCassettePlaying)}
                  className="btn px-6 py-2 hover:bg-marker hover:text-white font-kalam font-bold text-base flex items-center gap-2"
                >
                  {isCassettePlaying ? '⏸ Pause' : '▶ Listen (00:14)'}
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 8 — TESTIMONIALS
         ══════════════════════════════════════════ */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <SectionTitle 
            label="💬 comfort found here" 
            title="Words from Families" 
            subtitle="Notes left on corkboards by members who preserved legacy here."
          />

          <div className="grid md:grid-cols-3 gap-8 mt-6">
            {[
              {
                quote: "My whole family is scattered across continents. Eterna brought us back together around my father's journal timeline. We hadn't spoken in years.",
                name: "Priya S.",
                relation: "Daughter, lost her father",
                bg: "bg-postit",
                rot: -2,
              },
              {
                quote: "I met someone who lost her mother the exact same month I did. Eterna's caregiver tag connected us. Grief is lighter when shared.",
                name: "Lucas M.",
                relation: "Grandson",
                bg: "bg-white",
                rot: 1.5,
              },
              {
                quote: "It felt wrong to let my mother's letters sit inside drawers. Eterna gave her a beautiful, permanent notebook that our kids will read.",
                name: "Aisha T.",
                relation: "Daughter",
                bg: "bg-erased",
                rot: -1,
              },
            ].map((quote, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 80, delay: idx * 0.15 }}
                whileHover={{ y: -8, scale: 1.02, rotate: 0 }}
                className={`${quote.bg} border-[3px] border-ink p-8 shadow-hard relative tack-decoration text-left`}
                style={{ 
                  borderRadius: '12px 24px 12px 24px / 24px 12px 24px 12px',
                  transform: `rotate(${quote.rot}deg)`
                }}
              >
                <p className="font-patrick text-xl leading-relaxed italic mb-6">
                  "{quote.quote}"
                </p>
                <div className="border-t-2 border-dashed border-ink/20 pt-4 mt-2">
                  <span className="font-kalam text-lg font-bold text-ink block">{quote.name}</span>
                  <span className="font-patrick text-sm text-ink/50 block">— {quote.relation}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 9 — WHAT WE WILL NEVER BUILD
         ══════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-erased border-y-[4px] border-ink relative overflow-hidden">
        
        {/* Ink splash vector */}
        <InkSplash className="absolute left-[3%] bottom-[5%] w-32 h-32 opacity-25 pointer-events-none select-none" />

        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white border-[3px] border-ink p-8 md:p-14 shadow-hard-lg relative rotate-1"
            style={{ borderRadius: '15px 35px 15px 35px / 35px 15px 35px 15px' }}
          >
            <div className="paper-clip" />

            <h3 className="font-kalam text-3xl md:text-4xl text-marker font-bold mb-6 text-center underline decoration-wavy decoration-ink/15">
              What We Will Never Build
            </h3>

            <p className="font-patrick text-lg text-ink/60 text-center mb-8 max-w-md mx-auto">
              Eterna is designed entirely for memory, not attention models.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { label: "❌ Follower Counts", note: "Grief is not a social ladder." },
                { label: "❌ Likes & Reactions", note: "A passing is not a feed post." },
                { label: "❌ Trending Memorials", note: "Every life matters equally." },
                { label: "❌ Influencers", note: "Loss is not a content product." },
                { label: "❌ Algorithmic Feeds", note: "No infinite scroll. Breathe." },
                { label: "❌ Infinite Scroll", note: "Take your time. Remember." },
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-erased/50 border-[2px] border-ink p-4 flex flex-col justify-center text-left"
                  style={{ borderRadius: '8px 16px 8px 16px / 16px 8px 16px 8px' }}
                >
                  <span className="font-kalam text-xl font-bold text-ink">{item.label}</span>
                  <span className="font-patrick text-sm text-ink/55 italic mt-1">{item.note}</span>
                </div>
              ))}
            </div>

            <div className="text-center font-kalam text-2xl text-marker font-bold mt-10">
              "Grief is not a competition."
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 10 — WHY ETERNA IS DIFFERENT
         ══════════════════════════════════════════ */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          
          <SectionTitle 
            label="⚖️ compared with others" 
            title="Why Eterna is Different" 
            subtitle="Others capture content. Eterna preserves human connections."
          />

          <div className="grid md:grid-cols-2 gap-10 mt-6 items-stretch">
            
            {/* Left side: Others */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white border-[3px] border-ink p-8 shadow-hard relative flex flex-col gap-4 text-left rotate-[-1deg]"
            >
              <h4 className="font-kalam text-2xl font-bold text-ink/75 border-b-2 border-dashed border-ink/20 pb-2">
                Others
              </h4>
              <ul className="space-y-4 font-patrick text-lg md:text-xl text-ink/70">
                <li className="flex items-start gap-3">
                  <span className="text-red-500">❌</span>
                  <span>Store photos in giant unorganized media catalogs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500">❌</span>
                  <span>Post status updates that fade from feeds in hours.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500">❌</span>
                  <span>Chase screen retention metrics and clicks.</span>
                </li>
              </ul>
            </motion.div>

            {/* Right side: Eterna */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-postit border-[3px] border-ink p-8 shadow-hard relative flex flex-col gap-4 text-left rotate-[1.5deg]"
            >
              <div className="paper-clip" />
              <h4 className="font-kalam text-2xl font-bold text-ink border-b-2 border-dashed border-ink/25 pb-2">
                Eterna
              </h4>
              <ul className="space-y-4 font-patrick text-lg md:text-xl text-ink">
                <li className="flex items-start gap-3 font-bold">
                  <span className="text-green-600">❤️</span>
                  <span>Preserves human stories, letters, and timelines.</span>
                </li>
                <li className="flex items-start gap-3 font-bold">
                  <span className="text-green-600">❤️</span>
                  <span>Bridges families back together through catalogs.</span>
                </li>
                <li className="flex items-start gap-3 font-bold">
                  <span className="text-green-600">❤️</span>
                  <span>Guarantees privacy. Zero advertising or data metrics.</span>
                </li>
              </ul>
            </motion.div>

          </div>

          {/* Large summary block statement */}
          <div className="text-center mt-14 bg-white border-[3px] border-ink p-8 shadow-hard w-full max-w-3xl mx-auto rotate-[-0.5deg]">
            <p className="font-kalam text-3xl md:text-4xl font-bold text-ink leading-relaxed">
              Google stores photos.<br />
              Facebook stores posts.<br />
              <span className="text-marker text-4xl md:text-5xl font-bold block mt-3">
                <HighlightText>Eterna preserves people.</HighlightText>
              </span>
            </p>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
         ══════════════════════════════════════════ */}
      <section className="relative py-28 px-6 bg-marker text-white overflow-hidden text-center">
        
        {/* Torn paper transitions top and bottom */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-paper clip-torn-top" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-paper clip-torn-bottom" />

        <div className="max-w-4xl mx-auto flex flex-col gap-6 relative z-10 py-8">
          <h2 className="font-kalam text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Someone deserves<br/>to be remembered.
          </h2>
          <p className="font-patrick text-xl md:text-2xl text-white/85 max-w-xl mx-auto">
            Start preserving legacy memories before they become distant regrets. Reclaim family connection.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <MagneticButton 
              to={user ? "/memorials/create" : "/register"} 
              className="inline-flex items-center gap-2 px-10 py-5 bg-white border-[3px] border-ink text-ink font-kalam text-2xl shadow-hard hover:shadow-hard-hover -rotate-1"
              style={{ borderRadius: '15px 25px 15px 25px / 25px 15px 25px 15px' }}
            >
              Create a Memorial — Free ❤️
            </MagneticButton>
          </div>

          <p className="font-patrick text-sm text-white/60 mt-4">
            Free forever. No credit card. No feeds or metrics. Just heritage.
          </p>
        </div>
      </section>

    </div>
  );
}

/* Helper hook to return ref and visible state of element in viewport */
function useVisibleObserver(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}
