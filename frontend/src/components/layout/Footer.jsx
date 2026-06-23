import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto bg-white border-t-[3px] border-ink py-6 relative overflow-hidden">
      {/* Decorative scribbles */}
      <div className="absolute top-2 left-6 opacity-10 font-kalam text-2xl rotate-12 select-none pointer-events-none">~~</div>
      <div className="absolute bottom-2 right-6 opacity-10 font-kalam text-3xl -rotate-12 select-none pointer-events-none">*</div>

      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-[2px] border-ink bg-marker rounded-full shadow-hard"></div>
          <span className="font-kalam text-2xl font-bold">Eterna</span>
          <span className="font-patrick text-sm text-ink/50 hidden sm:inline">— A sketchbook of memory</span>
        </div>

        {/* Links List */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-patrick text-lg justify-center">
          <Link to="/" className="hover:text-marker hover:underline transition-colors">Home</Link>
          <Link to="/memorials" className="hover:text-marker hover:underline transition-colors">Memorials</Link>
          <Link to="/communities" className="hover:text-marker hover:underline transition-colors">Communities</Link>
          <Link to="/tales" className="hover:text-marker hover:underline transition-colors">Tales</Link>
          <Link to="/blog" className="hover:text-marker hover:underline transition-colors">Blog</Link>
          <Link to="/about" className="hover:text-marker hover:underline transition-colors">About</Link>
          <Link to="/contact" className="hover:text-marker hover:underline transition-colors">Contact</Link>
          <Link to="/privacy" className="hover:text-marker hover:underline transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-marker hover:underline transition-colors">Terms</Link>
          <Link to="/trust-charter" className="hover:text-marker hover:underline transition-colors">Our Promise</Link>
          <a 
            href="https://forms.gle/jPHUuWkMbHNGPahPA" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-marker hover:underline transition-colors"
          >
            Report a Bug 🐞
          </a>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-dashed border-ink/20 text-center font-kalam text-xs text-ink/40">
        © {new Date().getFullYear()} Eterna. Sketched with ❤️
      </div>
    </footer>
  );
}

