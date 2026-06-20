import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="flex flex-col gap-12 py-6 text-ink">
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
        className="bg-white border-[3px] border-ink p-8 md:p-12 shadow-hard wobbly-lg max-w-3xl mx-auto w-full relative"
      >
        <div className="absolute top-4 right-6 opacity-35 font-kalam text-4xl">*</div>
        <h2 className="font-kalam text-3xl font-bold mb-6 text-marker">Founder Story</h2>
        <div className="font-patrick text-xl leading-relaxed space-y-6">
          <p>
            When my grandfather passed away, the group chats overflowed with photos and stories. For a week, we shared tears and laughs. But as the months went by, the chat went quiet. The photos got buried under school updates and daily news. The voice notes he left got lost in the scroll.
          </p>
          <p>
            I realized that modern software isn't built for remembrance. It is built for the immediate present. Eterna was born out of that realization. I wanted to build a place that felt like an old family album tucked away in a drawer—something you open with intent, something that smells of old paper, and something that stays exactly where you left it.
          </p>
          <div className="flex justify-end pt-4 border-t-2 border-dashed border-ink/15">
            <p className="font-kalam text-xl font-bold">— Aum, Founder</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
