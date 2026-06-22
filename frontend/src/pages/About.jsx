import { motion } from 'framer-motion';
import SEO from '../components/layout/SEO';

export default function About() {
  return (
    <div className="flex flex-col gap-12 py-6 text-ink">
      <SEO 
        title="About Us & Our Manifesto – Eterna"
        description="Read Eterna's story, our mission to preserve human memories forever without algorithms or advertising, and why we built this sanctuary."
        keywords="about, mission, manifesto, founder story, legacy, Eterna"
      />
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="inline-block bg-postit text-ink border-[2px] border-ink px-4 py-1 font-kalam text-sm rotate-2 shadow-hard mb-4">
          📜 Our Manifesto
        </span>
        <h1 className="font-kalam text-5xl md:text-6xl font-bold mb-4">Eterna's Story</h1>
        <p className="font-patrick text-2xl text-ink/70 max-w-xl mx-auto">
          A space built to remember the ones we love, free from the noise of modern technology.
        </p>
      </motion.div>

      {/* Philosophy Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white border-[3px] border-ink p-8 md:p-12 shadow-hard wobbly-md relative max-w-3xl mx-auto w-full"
      >
        <div className="paper-clip" />
        <h2 className="font-kalam text-3xl font-bold mb-6 text-marker">Why Eterna Exists</h2>
        <div className="font-patrick text-xl leading-relaxed space-y-6">
          <p>
            Modern social networks were built to keep us looking forward, chasing the next notification, the next count, the next swipe. In doing so, they created a world where everything is ephemeral, where stories vanish in twenty-four hours, and where the people who shaped our lives are reduced to static archive pages.
          </p>
          <p>
            We built Eterna to change that. Eterna is a quiet digital sketchbook for families to slow down, write, and remember. It is designed to be a permanent, peaceful sanctuary where memories can grow, co-authored by the family members and friends who share them.
          </p>
        </div>
      </motion.div>

      {/* Manifesto/Refusal Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
        {/* Mission */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-postit border-[3px] border-ink p-8 shadow-hard rotate-1"
          style={{ borderRadius: '15px 30px 15px 30px / 30px 15px 30px 15px' }}
        >
          <h2 className="font-kalam text-2xl font-bold mb-4">Our Mission</h2>
          <div className="font-patrick text-xl leading-relaxed space-y-4">
            <p className="font-bold text-2xl text-marker">
              "Memories are the content. Stories are the bridge. Human connection is the outcome."
            </p>
            <p>
              We believe a digital memory should feel like sitting around a dinner table with family, sharing a laugh and a tear, not shouting inside a crowded stadium.
            </p>
          </div>
        </motion.div>

        {/* Refusal */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border-[3px] border-ink p-8 shadow-hard -rotate-1 wobbly-md"
        >
          <h2 className="font-kalam text-2xl font-bold mb-4">What We Refuse To Become</h2>
          <ul className="font-patrick text-xl leading-relaxed space-y-3">
            <li className="flex items-center gap-3">
              <span className="text-marker font-bold text-2xl">✗</span>
              <span className="line-through decoration-[2px] decoration-marker">No advertisements or sponsors.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-marker font-bold text-2xl">✗</span>
              <span className="line-through decoration-[2px] decoration-marker">No follower counts or status badges.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-marker font-bold text-2xl">✗</span>
              <span className="line-through decoration-[2px] decoration-marker">No algorithms or addictive feedback loops.</span>
            </li>
            <li className="pt-2 font-kalam font-bold text-ink/80 text-lg">
              ✓ Just pure story-telling and preservation.
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Founder Story */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border-[3px] border-ink p-8 md:p-12 shadow-hard wobbly-lg max-w-4xl mx-auto w-full relative"
      >
        <div className="absolute top-4 right-6 opacity-35 font-kalam text-4xl">*</div>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 text-left">
            <h2 className="font-kalam text-4xl font-bold mb-6 text-marker">Why I Created Eterna</h2>
            <div className="font-patrick text-xl leading-relaxed space-y-4 text-ink/90">
              <p>My name is Aum, and Eterna began with someone I loved deeply.</p>
              <p>His name was <strong>Max</strong>.</p>
              <p>To many people, Max was just a dog. To me, he was family.</p>
              <p>
                He rode with me on my scooter to beaches, parks, and countless ordinary places that became extraordinary because he was there. He was present during some of the happiest and hardest moments of my life. He wasn't simply a pet living in my house—he was like a second son of the family and, in many ways, my little brother.
              </p>
              <p>When Max passed away in 2025, I wasn't prepared for the silence he left behind.</p>
              <p>I kept wishing it was a nightmare. But reality doesn't wait for us to accept it.</p>
              <p>As I looked through old photos and memories, I realized something painful:</p>
              <p className="font-bold text-marker text-2xl font-kalam my-2">People and pets don't disappear only once.</p>
              <p>First, we lose them physically. Then, slowly, their stories fade. Their voices become harder to remember. The little moments—the ones that mattered most—begin to disappear. And eventually, memories become regrets.</p>
              <p>That realization changed me. I started asking myself:</p>
              <p className="italic pl-4 border-l-[3px] border-marker font-bold">
                "Where do our stories go? Where do we keep the memories that matter most? Why do we have platforms for content, followers, and endless scrolling, but so few places dedicated to preserving the people we love?"
              </p>
              <p>That's why I created Eterna.</p>
              <p>Eterna was never meant to be another social network. It's a home for memories. A place where families can preserve stories, photographs, voices, traditions, and moments that deserve to live beyond time.</p>
              <p>Because I believe love doesn't end with goodbye. And I believe nobody should disappear twice.</p>
              <p>Max became Eterna's first memory. Its first story. And its soul.</p>
              <p>If Eterna helps even one person save a memory before it becomes a regret, then Max's legacy will continue to live on.</p>
              <div className="pt-6 border-t-2 border-dashed border-ink/15 text-right">
                <p className="font-kalam text-2xl font-bold">— Aum Patro</p>
                <p className="font-patrick text-lg text-ink/60">Founder, Eterna</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-1 flex flex-col items-center">
            {/* Polaroid photo frame */}
            <div className="bg-white border-[3px] border-ink p-4 pb-8 shadow-hard rotate-3 hover:rotate-1 transition-transform duration-300 w-full max-w-[280px]">
              <div className="border-[3px] border-ink bg-erased aspect-[3/4] overflow-hidden relative">
                <img 
                  src={`${import.meta.env.BASE_URL}max.webp`} 
                  alt="Max on the beach" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="font-kalam text-2xl font-bold text-center mt-4 text-ink">Max ❤️</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bug Report Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-postit/40 border-[3px] border-ink p-8 shadow-hard wobbly-sm max-w-3xl mx-auto w-full text-center relative -rotate-0.5"
      >
        <span className="text-4xl block mb-4">🐞</span>
        <h2 className="font-kalam text-3xl font-bold mb-3 text-ink">Found a Bug or Have Feedback?</h2>
        <p className="font-patrick text-xl max-w-md mx-auto mb-6 text-ink/80">
          Eterna is crafted with care to preserve your memories. If something isn't working as expected or if you have ideas on how we can improve, we'd love to hear from you.
        </p>
        <a 
          href="https://forms.gle/jPHUuWkMbHNGPahPA" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary bg-marker text-white font-bold py-2.5 px-8 hover:-rotate-1 inline-flex items-center gap-2"
        >
          📝 Report Bug / Share Feedback
        </a>
      </motion.div>

    </div>
  );
}
