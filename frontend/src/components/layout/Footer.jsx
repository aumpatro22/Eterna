import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto bg-white border-t-[3px] border-ink py-12 relative overflow-hidden">
      {/* Decorative scribbles */}
      <div className="absolute top-4 left-10 opacity-20 font-kalam text-4xl rotate-12">~~~~</div>
      <div className="absolute bottom-10 right-10 opacity-20 font-kalam text-5xl -rotate-12">*</div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          
          {/* Brand */}
          <div className="paper-card p-6 rotate-1 tack-decoration">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 border-[3px] border-ink bg-marker rounded-full shadow-hard"></div>
              <span className="font-kalam text-3xl font-bold">Eterna</span>
            </div>
            <p className="font-patrick text-xl leading-relaxed">
              Every life is a story worth telling. Eterna is a sketchbook of memories, built to remember the ones we love.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-3 font-patrick text-xl">
              <h4 className="font-kalam font-bold text-2xl decoration-wavy underline mb-2">Explore</h4>
              <Link to="/" className="hover:text-marker hover:line-through w-fit transition-colors">Home</Link>
              <Link to="/tales" className="hover:text-marker hover:line-through w-fit transition-colors">Tales</Link>
              <Link to="/communities" className="hover:text-marker hover:line-through w-fit transition-colors">Communities</Link>
            </div>
            
            <div className="flex flex-col gap-3 font-patrick text-xl">
              <h4 className="font-kalam font-bold text-2xl decoration-wavy underline mb-2">Links</h4>
              <Link to="/about" className="hover:text-pen hover:line-through w-fit transition-colors">About</Link>
              <Link to="/privacy" className="hover:text-pen hover:line-through w-fit transition-colors">Privacy</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t-[3px] border-dashed border-ink text-center">
          <p className="font-kalam text-lg font-bold">
            © {new Date().getFullYear()} Eterna. Sketched with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
