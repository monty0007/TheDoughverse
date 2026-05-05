import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Generative Art Placeholder */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-[800px] h-[800px] border border-ink rounded-full animate-[spin_60s_linear_infinite] flex items-center justify-center">
          <div className="w-[600px] h-[600px] border border-ink rounded-full animate-[spin_40s_linear_infinite_reverse] flex items-center justify-center">
            <div className="w-[400px] h-[400px] border border-ink rounded-full animate-[spin_20s_linear_infinite]"></div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto"
      >
        <h1 className="text-9xl font-serif font-bold tracking-tighter mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-serif mb-8">Lost in the Latent Space</h2>
        <p className="text-ink/60 font-mono text-sm uppercase tracking-widest mb-12 leading-relaxed">
          The prompt you're looking for doesn't exist, or it hasn't been generated yet.
        </p>
        
        <Link
          to="/"
          className="flex items-center gap-2 px-8 py-4 bg-ink text-bg font-mono text-xs uppercase tracking-widest font-bold hover:bg-ink/80 transition-colors"
        >
          <Home className="w-4 h-4" /> Go Back Home
        </Link>
      </motion.div>
    </div>
  );
}
