import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/layout/SEO';

const POSTS_DATA = {
  "questions-to-ask-grandparents": {
    title: "Questions to Ask Grandparents Before It's Too Late",
    excerpt: "Discover the most meaningful questions to ask your grandparents to preserve their unique voice, heritage, and stories for generations to come.",
    date: "June 20, 2026",
    readTime: "5 min read",
    category: "Family Heritage",
    emoji: "👴",
    quote: "Every time an elder passes, a library burns to the ground. Let's record the pages."
  },
  "preserving-family-stories": {
    title: "Preserving Family Stories: A Step-by-Step Guide",
    excerpt: "Learn how to organize old photographs, collect fading audio messages, and build a lasting digital scrapbook that stays safe forever.",
    date: "June 15, 2026",
    readTime: "8 min read",
    category: "How-To Guide",
    emoji: "📸",
    quote: "A photo without a story is just a face. The story turns it into a legacy."
  },
  "grief-and-remembrance-in-digital-age": {
    title: "Grief and Remembrance in the Digital Age",
    excerpt: "How modern technology can be a sanctuary for healing. Exploring the transition from algorithmic notifications to quiet preservation spaces.",
    date: "June 08, 2026",
    readTime: "6 min read",
    category: "Reflections",
    emoji: "🕊️",
    quote: "We need quiet digital sanctuaries. Places built for memory, not metrics."
  }
};

export default function BlogDetail() {
  const { slug } = useParams();
  const post = POSTS_DATA[slug];

  if (!post) {
    return (
      <div className="text-center py-20 font-patrick">
        <h1 className="font-kalam text-5xl text-marker mb-4">Post Not Found</h1>
        <p className="text-2xl mb-8">We couldn't find the article you are looking for.</p>
        <Link to="/blog" className="btn btn-primary">Back to Journal</Link>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": "2026-06-20", // static date format for schema
    "image": "https://eterna-five-phi.vercel.app/eterna-logo.webp",
    "author": {
      "@type": "Organization",
      "name": "Eterna Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Eterna",
      "logo": {
        "@type": "ImageObject",
        "url": "https://eterna-five-phi.vercel.app/eterna-logo.webp"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://eterna-five-phi.vercel.app/blog/${slug}`
    }
  };

  return (
    <div className="flex flex-col gap-10 py-6 text-ink font-patrick text-xl text-left max-w-3xl mx-auto w-full">
      <SEO 
        title={`${post.title} – Eterna Journal`}
        description={post.excerpt}
        canonicalUrl={`https://eterna-five-phi.vercel.app/blog/${slug}`}
        ogType="article"
        jsonLd={articleSchema}
      />

      {/* Back link */}
      <div>
        <Link to="/blog" className="font-kalam text-lg text-ink/60 hover:text-marker hover:underline">
          ← Back to Notebook Journal
        </Link>
      </div>

      {/* Article Header */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="paper-card p-6 md:p-8 bg-postit tack-decoration rotate-1 flex flex-col gap-4"
      >
        <span className="w-fit bg-white border border-ink text-xs px-3 py-1 font-kalam font-bold -rotate-1 shadow-sm">
          {post.category}
        </span>
        <h1 className="font-kalam text-4xl md:text-5xl font-bold mb-2 leading-tight">{post.title}</h1>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-ink/60 border-t border-dashed border-ink/20 pt-4 mt-2">
          <span>📅 Published: {post.date}</span>
          <span>⏱️ Read time: {post.readTime}</span>
          <span>✍️ By Eterna Editorial Team</span>
        </div>
      </motion.div>

      {/* Article Body */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border-[3px] border-ink p-8 md:p-12 shadow-hard wobbly-md flex flex-col gap-6"
      >
        {/* Quote overlay */}
        <div className="border-l-4 border-marker pl-4 italic text-2xl text-ink/75 my-4 bg-erased/25 py-2">
          "{post.quote}"
        </div>

        {/* Excerpt as lead paragraph */}
        <p className="font-bold text-2xl leading-normal text-ink">
          {post.excerpt}
        </p>

        {/* Placeholder text indicating content is coming soon, as instructed */}
        <div className="border-2 border-dashed border-ink/20 p-6 bg-erased/20 rounded text-center my-6 flex flex-col items-center">
          <span className="text-4xl mb-2">🖋️</span>
          <h3 className="font-kalam text-2xl font-bold mb-2 text-marker">Sketches in Progress</h3>
          <p className="text-lg max-w-md">
            Thank you for reading! We are currently researching, interviewing, and editing this legacy guide with grief counseling experts and historians. 
          </p>
          <p className="text-base text-ink/65 mt-2">
            The full article with interactive storytelling worksheets will be available here soon.
          </p>
        </div>

        <p className="leading-relaxed">
          Memory preservation is an act of love and patience. Unlike typical social media feeds that incentivize instant reactions and fleeting thoughts, we design each article to be a timeless companion resource. When this guide is complete, it will offer downloadables, prompts, and direct worksheets to help you co-author history logs with your relatives.
        </p>

        <p className="leading-relaxed">
          In the meantime, feel free to start a free memorial page for your loved one, organize a timeline of life events, or light a digital candle. Sanctuaries are built one stone at a time.
        </p>

        {/* Footer actions */}
        <div className="border-t-[3px] border-dashed border-ink/20 pt-8 mt-6 flex justify-between items-center">
          <Link to="/blog" className="btn btn-secondary font-kalam font-bold py-2 px-6">
            ◀ Back to Journal
          </Link>
          <Link to="/register" className="btn btn-primary font-kalam font-bold py-2 px-6 -rotate-1">
            Start a Memorial — Free ❤️
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
