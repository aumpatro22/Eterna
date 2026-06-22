import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/layout/SEO';

const MOCK_POSTS = [
  {
    id: 1,
    title: "Questions to Ask Grandparents Before It's Too Late",
    slug: "questions-to-ask-grandparents",
    excerpt: "Discover the most meaningful questions to ask your grandparents to preserve their unique voice, heritage, and stories for generations to come.",
    date: "June 20, 2026",
    readTime: "5 min read",
    category: "Family Heritage",
    emoji: "👴"
  },
  {
    id: 2,
    title: "Preserving Family Stories: A Step-by-Step Guide",
    slug: "preserving-family-stories",
    excerpt: "Learn how to organize old photographs, collect fading audio messages, and build a lasting digital scrapbook that stays safe forever.",
    date: "June 15, 2026",
    readTime: "8 min read",
    category: "How-To Guide",
    emoji: "📸"
  },
  {
    id: 3,
    title: "Grief and Remembrance in the Digital Age",
    slug: "grief-and-remembrance-in-digital-age",
    excerpt: "How modern technology can be a sanctuary for healing. Exploring the transition from algorithmic notifications to quiet preservation spaces.",
    date: "June 08, 2026",
    readTime: "6 min read",
    category: "Reflections",
    emoji: "🕊️"
  }
];

export default function BlogList() {
  return (
    <div className="flex flex-col gap-12 py-6 text-ink font-patrick text-xl">
      <SEO 
        title="Legacy & Remembrance Blog – Eterna"
        description="Read articles and guides on family heritage preservation, capturing story logs, and navigating grief in a supportive digital space."
        keywords="blog, heritage, family history, grief support, memory preservation, Eterna"
      />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="inline-block bg-postit text-ink border-[2px] border-ink px-4 py-1 font-kalam text-sm rotate-2 shadow-hard mb-4">
          📖 Notebook Journal
        </span>
        <h1 className="font-kalam text-5xl md:text-6xl font-bold mb-4">Eterna Blog</h1>
        <p className="font-patrick text-2xl text-ink/70 max-w-xl mx-auto">
          Insights, guides, and stories on preserving legacy and finding comfort in shared memories.
        </p>
      </motion.div>

      {/* Posts List */}
      <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
        {MOCK_POSTS.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.01, rotate: 0 }}
            className={`paper-card p-6 md:p-8 bg-white border-[3px] border-ink shadow-hard flex flex-col md:flex-row gap-6 items-center ${
              idx % 2 === 0 ? '-rotate-1 tape-decoration' : 'rotate-1 tack-decoration'
            }`}
          >
            <div className="w-20 h-20 bg-erased border-2 border-ink rounded-full flex items-center justify-center text-4xl select-none flex-shrink-0">
              {post.emoji}
            </div>

            <div className="flex-1 text-left">
              <span className="inline-block bg-postit border border-ink text-xs px-2.5 py-0.5 font-kalam font-bold -rotate-1 shadow-sm mb-2">
                {post.category}
              </span>
              <h2 className="font-kalam text-3xl font-bold mb-2 group-hover:underline text-ink">
                <Link to={`/blog/${post.slug}`} className="hover:text-marker hover:underline transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-ink/80 leading-relaxed mb-4">{post.excerpt}</p>
              
              <div className="flex items-center gap-4 text-sm text-ink/50 border-t border-dashed border-ink/20 pt-3">
                <span>📅 {post.date}</span>
                <span>⏱️ {post.readTime}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
