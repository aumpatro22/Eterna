import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ─── Animated counter hook ────────────────────────────────── */
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

/* ─── Intersection observer hook ───────────────────────────── */
function useVisible(threshold = 0.15) {
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

/* ─── Floating paper scrap decoration ──────────────────────── */
function FloatingScrap({ children, rotate = 0, delay = 0, top, left, right, bottom, color = 'bg-postit' }) {
  return (
    <div
      className={`absolute hidden lg:block ${color} border-[2px] border-ink px-3 py-2 font-kalam text-sm shadow-hard pointer-events-none select-none`}
      style={{
        top, left, right, bottom,
        transform: `rotate(${rotate}deg)`,
        animation: `float-scrap 4s ease-in-out ${delay}s infinite alternate`,
        borderRadius: '15px 25px 15px 25px / 25px 15px 25px 15px',
      }}
    >
      {children}
    </div>
  );
}

/* ─── Story Step card ───────────────────────────────────────── */
function StoryStep({ number, title, description, emoji, rotate, ref: fwdRef, visible }) {
  return (
    <div
      ref={fwdRef}
      className={`paper-card p-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transform: visible ? `rotate(${rotate}deg)` : `rotate(0deg) translateY(40px)`, transitionDelay: `${number * 120}ms` }}
    >
      <div className="flex items-start gap-5">
        <div className="w-14 h-14 flex-shrink-0 rounded-full border-[3px] border-ink bg-marker text-white font-kalam text-2xl flex items-center justify-center shadow-hard">
          {number}
        </div>
        <div>
          <div className="text-3xl mb-1">{emoji}</div>
          <h3 className="font-kalam text-2xl mb-2">{title}</h3>
          <p className="font-patrick text-lg text-ink/80 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature card ──────────────────────────────────────────── */
function FeatureCard({ icon, title, description, rotate, visible, delay }) {
  return (
    <div
      className={`paper-card p-8 flex flex-col gap-4 transition-all duration-700`}
      style={{
        transform: visible ? `rotate(${rotate}deg)` : `rotate(0deg) translateY(32px)`,
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="text-5xl">{icon}</div>
      <h3 className="font-kalam text-2xl">{title}</h3>
      <p className="font-patrick text-lg text-ink/80 leading-relaxed">{description}</p>
    </div>
  );
}

/* ─── Testimonial sticky note ───────────────────────────────── */
function Testimonial({ quote, name, relation, rotate, color, visible, delay }) {
  return (
    <div
      className={`${color} border-[3px] border-ink p-6 shadow-hard transition-all duration-700 tack-decoration`}
      style={{
        borderRadius: '15px 25px 15px 25px / 25px 15px 25px 15px',
        transform: visible ? `rotate(${rotate}deg)` : `rotate(0deg) translateY(24px)`,
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay}ms`,
      }}
    >
      <p className="font-patrick text-xl leading-relaxed mb-4 italic">"{quote}"</p>
      <div className="border-t-[2px] border-dashed border-ink/30 pt-3">
        <span className="font-kalam text-lg font-bold">{name}</span>
        <span className="font-patrick text-sm text-ink/60 ml-2">— {relation}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function Landing() {
  /* hero typewriter */
  const phrases = ['Every life is a story.', 'Preserve them forever.', 'Share them with love.'];
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
      timeout = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, phraseIdx]);

  useEffect(() => {
    const t = setInterval(() => setCursorBlink(b => !b), 530);
    return () => clearInterval(t);
  }, []);

  /* section visibility */
  const [stepsRef, stepsVisible] = useVisible();
  const [featRef, featVisible] = useVisible();
  const [statsRef, statsVisible] = useVisible();
  const [quotesRef, quotesVisible] = useVisible();
  const [ctaRef, ctaVisible] = useVisible();

  /* animated counters */
  const memCount = useCountUp(1200, 2000, statsVisible);
  const storiesCount = useCountUp(8400, 2200, statsVisible);
  const familiesCount = useCountUp(340, 1800, statsVisible);

  /* notebook tilt on mouse */
  const notebookRef = useRef(null);
  const handleMouseMove = (e) => {
    if (!notebookRef.current) return;
    const rect = notebookRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    notebookRef.current.style.transform = `rotateY(${dx * 12}deg) rotateX(${-dy * 8}deg)`;
  };
  const handleMouseLeave = () => {
    if (notebookRef.current) notebookRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
  };

  return (
    <div className="flex flex-col gap-0 overflow-x-hidden">

      {/* ── Floating keyframes ── */}
      <style>{`
        @keyframes float-scrap {
          from { transform: translateY(0px) rotate(var(--r, 0deg)); }
          to   { transform: translateY(-14px) rotate(var(--r, 0deg)); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes hero-pulse {
          0%, 100% { box-shadow: 6px 6px 0 #2d2d2d; }
          50% { box-shadow: 10px 10px 0 #2d2d2d; }
        }
        .hero-anim { animation: slide-up 0.8s ease forwards; }
        .hero-anim-2 { animation: slide-up 0.8s ease 0.2s both; }
        .hero-anim-3 { animation: slide-up 0.8s ease 0.4s both; }
        .hero-anim-4 { animation: slide-up 0.8s ease 0.6s both; }
        .notebook-wrap { perspective: 900px; }
        .notebook-inner { transition: transform 0.12s ease; transform-style: preserve-3d; }
        .stat-num { font-variant-numeric: tabular-nums; }
      `}</style>

      {/* ══════════════════════════════════════════
          HERO
         ══════════════════════════════════════════ */}
      <section
        className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Decorative floating scraps */}
        <FloatingScrap top="8%" left="3%" rotate={-8} delay={0}>📖 1923–2001</FloatingScrap>
        <FloatingScrap top="15%" right="4%" rotate={6} delay={0.5} color="bg-white">✉️ A letter from grandma</FloatingScrap>
        <FloatingScrap bottom="18%" left="5%" rotate={4} delay={1} color="bg-erased">🌸 Memory Lane</FloatingScrap>
        <FloatingScrap bottom="22%" right="3%" rotate={-5} delay={0.8}>💛 Forever remembered</FloatingScrap>

        {/* Dashed border frame */}
        <div className="absolute inset-6 border-[3px] border-dashed border-ink/15 rounded-none pointer-events-none hidden md:block" />

        <div className="relative z-10 max-w-5xl w-full grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <div className="flex flex-col gap-6">

            {/* Eyebrow tag */}
            <div className="hero-anim">
              <span className="inline-block bg-marker text-white font-kalam px-4 py-1 text-sm -rotate-1 shadow-hard border-[2px] border-ink">
                ✨ A place for memory, not metrics
              </span>
            </div>

            {/* Typewriter headline */}
            <h1 className="font-kalam text-5xl md:text-6xl lg:text-7xl leading-tight hero-anim-2">
              <span className="text-marker">{displayed}</span>
              <span
                className="inline-block w-[3px] h-[1em] align-middle bg-ink ml-1"
                style={{ opacity: cursorBlink ? 1 : 0 }}
              />
            </h1>

            <p className="font-patrick text-xl md:text-2xl text-ink/80 leading-relaxed max-w-lg hero-anim-3">
              Eterna is a living sketchbook of memory — where families preserve loved ones'
              stories, share heartfelt memories, and realize they are never truly alone.
            </p>

            <div className="flex flex-wrap gap-4 hero-anim-4">
              <Link
                to="/register"
                className="btn btn-primary text-xl -rotate-1"
                style={{ animation: 'hero-pulse 2.5s ease-in-out infinite' }}
              >
                Start a Memorial Free →
              </Link>
              <a href="#how-it-works" className="btn btn-secondary text-xl rotate-1">
                See How It Works
              </a>
            </div>

            {/* Trust micro-copy */}
            <p className="font-patrick text-sm text-ink/50 hero-anim-4">
              No follower counts. No algorithms. No advertising. Just memories.
            </p>
          </div>

          {/* Right: 3D notebook hero art */}
          <div className="notebook-wrap flex justify-center items-center">
            <div ref={notebookRef} className="notebook-inner w-72 md:w-80">
              <div className="relative bg-white border-[4px] border-ink shadow-hard-lg p-6"
                style={{ borderRadius: '8px 25px 8px 25px / 25px 8px 25px 8px' }}>

                {/* Notebook spine */}
                <div className="absolute left-0 inset-y-0 w-5 bg-marker border-r-[3px] border-ink" />

                {/* Spiral dots */}
                <div className="absolute left-2 inset-y-0 flex flex-col justify-around py-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-white border-[2px] border-ink" />
                  ))}
                </div>

                <div className="pl-6 flex flex-col gap-4">
                  <div className="text-center border-b-[2px] border-dashed border-ink/30 pb-3">
                    <p className="font-kalam text-2xl">In Loving Memory</p>
                    <p className="font-patrick text-base text-ink/60 mt-1">of someone dearly loved</p>
                  </div>

                  {/* Polaroid photo placeholder */}
                  <div className="bg-erased border-[3px] border-ink p-2 shadow-hard -rotate-2 self-center w-40">
                    <div className="bg-ink/5 h-28 flex items-center justify-center">
                      <span className="text-5xl">👴</span>
                    </div>
                    <p className="font-kalam text-center text-sm mt-2 text-ink/70">1941 — 2023</p>
                  </div>

                  {/* Handwritten lines */}
                  {['He loved gardening…', 'Every Sunday morning…', 'His laughter echoed…'].map((line, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <p className="font-patrick text-sm">{line}</p>
                      <div className="border-b border-ink/20" />
                    </div>
                  ))}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['🏷️ Lost Father', '🌱 Caregiver'].map(t => (
                      <span key={t} className="text-xs font-patrick bg-postit border border-ink px-2 py-0.5 rotate-1">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="font-kalam text-sm text-ink/40">Scroll to explore</span>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/30">
            <path d="M10 4v12M4 10l6 6 6-6" />
          </svg>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          EMOTION BRIDGE — The story of Sarah
         ══════════════════════════════════════════ */}
      <section className="relative bg-postit border-y-[4px] border-ink py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #2d2d2d 31px, #2d2d2d 32px)',
            backgroundSize: '100% 32px',
          }}
        />

        <div className="relative max-w-3xl mx-auto text-center flex flex-col gap-6">
          <div className="inline-block bg-white border-[3px] border-ink px-4 py-1 font-kalam text-sm rotate-2 shadow-hard self-center">
            📜 A real story
          </div>
          <h2 className="font-kalam text-4xl md:text-5xl leading-tight">
            Sarah lost her grandmother.<br />
            <span className="text-marker">She didn't lose her memory.</span>
          </h2>
          <div className="font-patrick text-xl md:text-2xl text-ink/80 leading-relaxed max-w-2xl mx-auto text-left space-y-4 bg-white border-[3px] border-ink p-8 shadow-hard"
            style={{ borderRadius: '15px 25px 15px 25px / 25px 15px 25px 15px' }}>
            <p>Sarah created a memorial page for her grandmother Elena. She uploaded old photos, wrote her biography, and added a timeline of milestones — her first garden in 1962, her 50th anniversary in 1989.</p>
            <p>Her cousins across three continents added their own memories. A stranger named Maria left a guestbook note — she had lost her grandmother the same month. They started talking.</p>
            <p className="font-kalam text-2xl text-marker">They became friends.</p>
            <p>The memorial was the beginning, not the destination.</p>
          </div>
          <Link to="/register" className="btn btn-primary text-xl self-center mt-4">
            Begin Your Story →
          </Link>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          HOW IT WORKS
         ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 px-6" ref={stepsRef}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-kalam text-5xl md:text-6xl mb-3">
              How It Works
            </h2>
            <p className="font-patrick text-xl text-ink/70">Four simple steps to start preserving a legacy.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { emoji: '📖', title: 'Create a Memorial', description: 'Give your loved one a dedicated page with their biography, photos, and life milestones. Choose who can see it — public, family only, or private.', rotate: -1 },
              { emoji: '✍️', title: 'Add Memories to the Lane', description: 'You and contributors can pin text memories, attach photos, or upload voice notes. Each memory is dated and preserved forever.', rotate: 1 },
              { emoji: '🤝', title: 'Invite Family to Contribute', description: 'Invite relatives and close friends by username. They can add stories, photos, and timeline events — all in one shared place.', rotate: -0.5 },
              { emoji: '🌐', title: 'Connect with Others', description: 'Experience Tags like "Lost Grandmother" or "Caregiver" connect memorials with similar stories, gently introducing people who understand.', rotate: 1 },
            ].map((step, i) => (
              <StoryStep
                key={i}
                number={i + 1}
                emoji={step.emoji}
                title={step.title}
                description={step.description}
                rotate={step.rotate}
                visible={stepsVisible}
              />
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          FEATURES
         ══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-erased border-y-[4px] border-ink" ref={featRef}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-kalam text-5xl md:text-6xl mb-3">Everything You Need</h2>
            <p className="font-patrick text-xl text-ink/70">Built with empathy, not engagement metrics.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🖼️', title: 'Photo Albums', description: 'Upload a profile portrait, a cover image, and unlimited additional photos — displayed as beautiful hand-held polaroids.', rotate: -1, delay: 0 },
              { icon: '⏳', title: 'Life Timeline', description: 'Add chronological milestones — births, graduations, travels — rendered as an elegant handwritten timeline.', rotate: 1, delay: 80 },
              { icon: '🎙️', title: 'Voice Notes', description: "Attach an audio recording to any memory. Hear a loved one's laughter or voice, preserved forever.", rotate: -0.5, delay: 160 },
              { icon: '🔒', title: 'Privacy Controls', description: 'Choose Public, Family Only, or Private for every memorial and individual memory. You decide who sees what.', rotate: 0.5, delay: 240 },
              { icon: '📬', title: 'Guestbook', description: 'Visitors can leave heartfelt notes. No likes, no reactions — just genuine, permanent messages of love.', rotate: -1, delay: 320 },
              { icon: '🏷️', title: 'Experience Tags', description: '"Lost Grandmother", "Cancer Survivor", "Pet Loss" — shared tags gently connect people with similar grief journeys.', rotate: 1, delay: 400 },
            ].map((f, i) => (
              <FeatureCard key={i} {...f} visible={featVisible} />
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          STATS
         ══════════════════════════════════════════ */}
      <section className="py-20 px-6" ref={statsRef}>
        <div className="max-w-5xl mx-auto">
          <div className="paper-card bg-postit p-10 md:p-16 -rotate-1 tape-decoration">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
              {[
                { count: memCount, suffix: '+', label: 'Memorials Created', icon: '📖' },
                { count: storiesCount, suffix: '+', label: 'Memories Shared', icon: '✍️' },
                { count: familiesCount, suffix: '+', label: 'Families Connected', icon: '🤝' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="text-5xl">{s.icon}</div>
                  <div className="font-kalam text-6xl md:text-7xl text-marker stat-num">
                    {s.count.toLocaleString()}{s.suffix}
                  </div>
                  <p className="font-patrick text-xl text-ink/75">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          TESTIMONIALS / GUESTBOOK NOTES
         ══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white border-y-[4px] border-ink" ref={quotesRef}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-kalam text-5xl md:text-6xl mb-3">
              Words from Families
            </h2>
            <p className="font-patrick text-xl text-ink/70">Real notes from people who found comfort here.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "My whole family is scattered across four countries. Eterna brought us together around my father's memory. We hadn't spoken in years.",
                name: 'Priya S.',
                relation: 'Daughter, lost her father',
                rotate: -2,
                color: 'bg-postit',
                delay: 0,
              },
              {
                quote: 'I found someone who lost their grandmother the same week I did. We understood each other instantly. Eterna made that connection happen.',
                name: 'Lucas M.',
                relation: 'Grandson',
                rotate: 1,
                color: 'bg-white',
                delay: 120,
              },
              {
                quote: 'It felt wrong to let my mom exist only in my phone photos. She deserved a real place. Eterna gave her that.',
                name: 'Aisha T.',
                relation: 'Daughter',
                rotate: -1,
                color: 'bg-erased',
                delay: 240,
              },
            ].map((q, i) => (
              <Testimonial key={i} {...q} visible={quotesVisible} />
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          PHILOSOPHY / PRINCIPLES
         ══════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="paper-card p-10 md:p-14 rotate-1">
            <h2 className="font-kalam text-4xl md:text-5xl mb-8 text-center underline decoration-wavy decoration-marker">
              What We Will Never Build
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { label: '❌ Follower counts', note: 'Grief is not a competition.' },
                { label: '❌ Trending memorials', note: 'Every life matters equally.' },
                { label: '❌ Likes & reactions', note: 'A death is not a post.' },
                { label: '❌ Algorithmic feeds', note: 'Memory is not content.' },
                { label: '❌ Influencers', note: 'No one profits from loss here.' },
                { label: '❌ Infinite scrolling', note: 'Take your time. Breathe.' },
              ].map((p, i) => (
                <div key={i} className="flex gap-4 items-start bg-erased p-4 border-[2px] border-ink"
                  style={{ borderRadius: '8px 15px 8px 15px / 15px 8px 15px 8px' }}>
                  <div className="font-kalam text-lg font-bold flex-1">{p.label}</div>
                  <div className="font-patrick text-base text-ink/60 italic">{p.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          FINAL CTA
         ══════════════════════════════════════════ */}
      <section
        className="relative py-24 px-6 bg-marker border-y-[4px] border-ink overflow-hidden"
        ref={ctaRef}
      >
        {/* Torn paper edge top */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-paper"
          style={{ clipPath: 'polygon(0 0, 5% 100%, 10% 20%, 15% 90%, 20% 10%, 25% 80%, 30% 5%, 35% 95%, 40% 15%, 45% 85%, 50% 0, 55% 90%, 60% 10%, 65% 80%, 70% 5%, 75% 95%, 80% 15%, 85% 85%, 90% 20%, 95% 100%, 100% 0)' }}
        />
        {/* Torn paper edge bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-paper"
          style={{ clipPath: 'polygon(0 100%, 5% 0, 10% 80%, 15% 10%, 20% 90%, 25% 20%, 30% 95%, 35% 5%, 40% 85%, 45% 15%, 50% 100%, 55% 10%, 60% 90%, 65% 20%, 70% 95%, 75% 5%, 80% 85%, 85% 15%, 90% 80%, 95% 0, 100% 100%)' }}
        />

        <div
          className="max-w-3xl mx-auto text-center flex flex-col gap-8 transition-all duration-1000"
          style={{ opacity: ctaVisible ? 1 : 0, transform: ctaVisible ? 'translateY(0)' : 'translateY(32px)' }}
        >
          <h2 className="font-kalam text-5xl md:text-6xl lg:text-7xl text-white leading-tight">
            Someone deserves<br />to be remembered.
          </h2>
          <p className="font-patrick text-xl md:text-2xl text-white/85 leading-relaxed">
            It takes five minutes to create a memorial page.<br />
            It lasts forever.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white border-[3px] border-ink text-ink font-kalam text-2xl shadow-hard -rotate-1 transition-all hover:-translate-y-1 hover:shadow-hard-lg"
              style={{ borderRadius: '15px 25px 15px 25px / 25px 15px 25px 15px' }}
            >
              Create a Memorial — Free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-5 bg-transparent border-[3px] border-white text-white font-kalam text-xl rotate-1 transition-all hover:bg-white hover:text-ink"
              style={{ borderRadius: '15px 25px 15px 25px / 25px 15px 25px 15px' }}
            >
              Log In →
            </Link>
          </div>
          <p className="font-patrick text-sm text-white/60">
            Free forever. No credit card. No ads. Ever.
          </p>
        </div>
      </section>

    </div>
  );
}
