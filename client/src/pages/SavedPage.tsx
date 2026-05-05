import { motion } from 'motion/react';
import { Gallery } from '../components/Gallery';
import { ImageModal } from '../components/ImageModal';
import { useGalleryStore } from '../store/useGalleryStore';
import { Bookmark, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export function SavedPage() {
  const { getSavedImages } = useGalleryStore();
  const savedImages = getSavedImages();

  const handleExport = () => {
    if (savedImages.length === 0) {
      toast.error('No saved prompts to export');
      return;
    }

    const content = savedImages.map(img => `Title: ${img.title}\nModel: ${img.model}\nPrompt: ${img.prompt}\n---\n`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'the-dough-affair-saved-prompts.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Prompts exported successfully');
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col pt-24">
      {/* Header */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-end gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-serif mb-2 flex items-center gap-4">
              <Bookmark className="w-8 h-8" /> Saved
            </h1>
            <p className="text-ink/60 font-mono text-xs uppercase tracking-widest">Your personal collection of inspiration</p>
          </div>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-ink text-bg font-mono text-xs uppercase tracking-widest font-bold hover:bg-ink/80 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Prompts
          </button>
        </motion.div>
      </section>

      {/* Gallery */}
      <main className="flex-1 w-full bg-surface/30">
        {savedImages.length > 0 ? (
          <Gallery images={savedImages} />
        ) : (
          <div className="w-full py-32 flex flex-col items-center justify-center text-ink/40 gap-4">
            <Bookmark className="w-12 h-12 opacity-20" />
            <p className="font-mono text-sm uppercase tracking-widest">No saved images yet</p>
          </div>
        )}
      </main>

      {/* Modal */}
      <ImageModal />
    </div>
  );
}
