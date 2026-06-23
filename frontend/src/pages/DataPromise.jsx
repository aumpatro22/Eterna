import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/layout/SEO';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function PromiseCard({ title, icon, children, rotate = '0', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white border-[3px] border-ink p-6 md:p-8 shadow-hard relative"
      style={{
        transform: `rotate(${rotate}deg)`,
        borderRadius: '12px 24px 12px 24px / 24px 12px 24px 12px',
      }}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl md:text-4xl shrink-0 mt-1">{icon}</span>
        <div>
          <h2 className="font-kalam text-2xl md:text-3xl font-bold mb-3 text-ink">{title}</h2>
          <div className="font-patrick text-lg md:text-xl leading-relaxed text-ink/80 space-y-3">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DataPromise() {
  return (
    <div className="flex flex-col gap-10 py-6 text-ink max-w-3xl mx-auto">
      <SEO
        title="Our Promise to You – Eterna Trust Charter"
        description="Eterna's Trust Charter. A personal commitment about data ownership, privacy, thoughtful design, and dignity-first principles."
        keywords="trust charter, data promise, ownership, privacy, Eterna"
      />

      {/* Hero */}
      <motion.div
        {...fadeUp}
        className="text-center"
      >
        <span className="inline-block bg-postit text-ink border-[2px] border-ink px-4 py-1 font-kalam text-sm rotate-1 shadow-hard mb-4">
          💛 A Promise, Not a Contract
        </span>
        <h1 className="font-kalam text-4xl md:text-5xl font-bold mb-3">Our Promise to You</h1>
        <p className="font-patrick text-xl text-ink/60 max-w-lg mx-auto">
          The Eterna Trust Charter
        </p>
      </motion.div>

      {/* What this is */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-postit/30 border-[3px] border-ink p-6 md:p-8 shadow-hard wobbly-sm relative"
      >
        <div className="paper-clip" />
        <p className="font-patrick text-xl leading-relaxed text-ink/85">
          This is not a legal document. This is a personal commitment from the people who build Eterna to the families who trust us with their most meaningful memories. Our legal commitments are in our{' '}
          <Link to="/privacy" className="text-marker underline hover:opacity-80 transition-opacity">Privacy Policy</Link> and{' '}
          <Link to="/terms" className="text-marker underline hover:opacity-80 transition-opacity">Terms of Service</Link>.
          This document goes further — it explains <em>why</em> we built Eterna the way we did, and the principles that guide our decisions.
        </p>
      </motion.div>

      {/* Promise Cards */}
      <div className="flex flex-col gap-6">

        <PromiseCard title="You Own Your Memories" icon="👑" rotate="0.5" delay={0.15}>
          <p>Your photographs belong to you. Your stories belong to you. Your voice recordings, family videos, children's drawings — all of it belongs to you.</p>
          <p className="font-kalam font-bold text-marker text-lg">Eterna is the shelf. You are the owner of everything on it.</p>
          <p>We do not claim ownership of anything you upload. Your family's private memories are not used to train AI models for third parties without your consent. We do not sell your content.</p>
        </PromiseCard>

        <PromiseCard title="We Do Not Sell Your Data" icon="🚫" rotate="-0.3" delay={0.2}>
          <p>Eterna is not an advertising platform. We don't make money by profiling you, tracking your behavior across the internet, or selling your information to data brokers.</p>
          <p className="font-kalam font-bold text-ink/80">Our business model is designed to be simple: provide a valuable service and charge fairly for it. Your attention is not our product. Your data is not our currency.</p>
        </PromiseCard>

        <PromiseCard title="Your Memories Deserve Dignity" icon="✨" rotate="0.4" delay={0.25}>
          <p>Eterna is designed to be a space free from targeted advertisements and algorithmic manipulation. We believe your grandmother's letters and your child's birthday video deserve a space that respects them.</p>
          <p className="font-kalam font-bold text-marker">Some spaces deserve to be protected. Your family's legacy is one of them.</p>
          <p className="text-ink/60 text-base">If Eterna ever introduces partnerships or sponsorships in the future, they will be transparent, clearly identified, and designed to respect the dignity of your memories. We will not place ads between your personal content.</p>
        </PromiseCard>

        <PromiseCard title="Privacy Is a Design Decision" icon="🔒" rotate="-0.5" delay={0.3}>
          <p>Privacy isn't bolted on as an afterthought. It's a foundational principle in how we build.</p>
          <p>When we design a feature, the first question isn't "How can we get more engagement?" It's <em>"Does this respect the family using it?"</em></p>
          <p>We are intentional about not optimizing for time-on-site, not sending manipulative notifications, and not using dark patterns to prevent you from leaving.</p>
        </PromiseCard>

        <PromiseCard title="AI Assists. AI Does Not Own." icon="🤖" rotate="0.3" delay={0.35}>
          <p>AI tools exist to save you time — transcribing recordings, organizing timelines, drafting tributes. But AI is a tool. It is not the author. It is not the owner.</p>
          <p>Anything AI creates based on your content belongs to you. Your personal content is not used to train third-party AI models without your consent. If we introduce opt-in AI features in the future, they will be clearly disclosed with transparent controls.</p>
          <p>AI should make preserving memories easier. It should not replace the human meaning behind them.</p>
        </PromiseCard>

        {/* Honest Limitations — special treatment */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-[3px] border-ink shadow-hard overflow-hidden"
          style={{ borderRadius: '12px 24px 12px 24px / 24px 12px 24px 12px' }}
        >
          <div className="bg-white p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="text-3xl md:text-4xl shrink-0 mt-1">💡</span>
              <h2 className="font-kalam text-2xl md:text-3xl font-bold text-ink">Honest About Our Limits</h2>
            </div>

            {/* Can commit to */}
            <div className="mb-6">
              <h3 className="font-kalam text-xl font-bold text-marker mb-3">What we commit to:</h3>
              <ul className="font-patrick text-lg md:text-xl leading-relaxed text-ink/80 space-y-2">
                {[
                  'We will treat your data with care and respect.',
                  'We will use reasonable, industry-standard security measures.',
                  'We will be transparent about how we use your data.',
                  'We will give you meaningful control over your content and account.',
                  'We will provide tools designed to export your data so you are not locked in.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold text-xl mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cannot promise */}
            <div className="bg-postit/20 border-2 border-dashed border-ink/20 p-5" style={{ borderRadius: '8px' }}>
              <h3 className="font-kalam text-xl font-bold text-ink/80 mb-3">What we cannot promise:</h3>
              <ul className="font-patrick text-lg md:text-xl leading-relaxed text-ink/70 space-y-2">
                {[
                  'We cannot promise Eterna will exist indefinitely. No company can.',
                  'We cannot claim zero-knowledge encryption unless we have truly implemented it.',
                  'We cannot promise absolute security. No platform on the internet can.',
                  'We cannot guarantee data will never be lost. Hardware fails. Software has bugs. The world is unpredictable.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-ink/40 font-bold text-xl mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <PromiseCard title="Keep Your Own Backups" icon="💾" rotate="-0.2" delay={0.45}>
          <p>We say this not to diminish our responsibility, but to increase yours — because these memories matter too much to exist in only one place.</p>
          <p>Keep copies on external drives. Print the photographs that matter most. Store important documents in more than one location.</p>
          <p className="font-kalam font-bold text-ink/80">We will work hard to keep your memories safe. But the memories are yours, and their ultimate safety is in your hands.</p>
        </PromiseCard>

        <PromiseCard title="Dignity Above Everything" icon="🕊️" rotate="0.4" delay={0.5}>
          <p>Eterna serves families through births, milestones, losses, and legacies. These moments are not engagement opportunities.</p>
          <p className="font-kalam font-bold text-marker">We are committed to not gamifying grief and not exploiting nostalgia for retention metrics.</p>
          <p>Dignity is not a feature. It is our obligation.</p>
        </PromiseCard>

        <PromiseCard title="If We Get It Wrong" icon="🙋" rotate="-0.3" delay={0.55}>
          <p>We are human. We will make mistakes. When we do, our intent is to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acknowledge the mistake honestly.</li>
            <li>Communicate clearly about what happened and what we're doing to fix it.</li>
            <li>Prioritize your data and trust over our pride or convenience.</li>
          </ul>
          <p>We'd rather admit a flaw and fix it than hide behind corporate language.</p>
        </PromiseCard>
      </div>

      {/* Closing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white border-[3px] border-ink p-8 md:p-10 shadow-hard wobbly-md text-center"
      >
        <p className="font-patrick text-xl md:text-2xl leading-relaxed text-ink/80 mb-6">
          Eterna was built because we believe every family's story deserves to be preserved — on your terms, in your space, with your control.
        </p>
        <p className="font-kalam text-lg text-ink/60 mb-6 italic">
          We are grateful you trust us with something as precious as your family's memories. We do not take that trust lightly.
        </p>
        <div className="pt-4 border-t-2 border-dashed border-ink/15">
          <p className="font-kalam text-2xl font-bold">— The Eterna Team</p>
          <p className="font-patrick text-lg text-ink/50 mt-2">hello@eterna.app</p>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="text-center"
      >
        <p className="font-patrick text-base text-ink/40 italic">
          This Trust Charter reflects our current intentions and guiding principles. It is not a legally binding contract. Our legal obligations are defined in our Privacy Policy and Terms of Service. Eterna reserves the right to update this document as our platform evolves.
        </p>
      </motion.div>

      {/* Legal links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-wrap gap-4 justify-center font-patrick text-lg"
      >
        <Link to="/privacy" className="text-marker underline hover:opacity-80 transition-opacity">Privacy Policy</Link>
        <span className="text-ink/30">•</span>
        <Link to="/terms" className="text-marker underline hover:opacity-80 transition-opacity">Terms of Service</Link>
        <span className="text-ink/30">•</span>
        <Link to="/about" className="text-marker underline hover:opacity-80 transition-opacity">About Eterna</Link>
      </motion.div>
    </div>
  );
}
