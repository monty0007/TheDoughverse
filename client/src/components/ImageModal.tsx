import { motion, AnimatePresence } from 'motion/react';
import { useGalleryStore } from '../store/useGalleryStore';
import { X, Copy, Check, PenTool, Sparkles, Heart, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { API_BASE } from '../lib/api';
import { ImageItem, mapApiImage } from '../data/mockData';

interface SimilarImage {
  id: string;
  title: string;
  url: string;
  tags: { id: string; name: string; slug: string }[];
}

export function ImageModal() {
  const { selectedImage, setSelectedImage, savedImageIds, toggleSavedImage, getFilteredImages } = useGalleryStore();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [similarImages, setSimilarImages] = useState<SimilarImage[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const navigate = useNavigate();

  const allImages = getFilteredImages();
  const currentIndex = selectedImage ? allImages.findIndex(img => img.id === selectedImage.id) : -1;

  useEffect(() => {
    if (selectedImage) {
      setLiked(false);
      setLikeCount(selectedImage.likes);
      setCopied(false);
    }
  }, [selectedImage]);

  // Fetch similar images when selectedImage changes
  useEffect(() => {
    if (!selectedImage) {
      setSimilarImages([]);
      return;
    }

    setLoadingSimilar(true);
    fetch(`${API_BASE}/api/images/${selectedImage.id}/similar`)
      .then(res => res.ok ? res.json() : [])
      .then((data: SimilarImage[]) => {
        let results = Array.isArray(data) ? data : [];

        // If fewer than 4 similar images, fill with other images from the store
        if (results.length < 4) {
          const existingIds = new Set([selectedImage.id, ...results.map(r => r.id)]);
          const fallbacks = allImages
            .filter(img => !existingIds.has(img.id))
            .slice(0, 8 - results.length)
            .map(img => ({
              id: img.id,
              title: img.title,
              url: img.imageUrl,
              tags: img.style.map(s => ({ id: s, name: s, slug: s.toLowerCase() })),
            }));
          results = [...results, ...fallbacks];
        }

        setSimilarImages(results.slice(0, 8));
        setLoadingSimilar(false);
      })
      .catch(() => {
        // Fallback: use local store images
        const fallbacks = allImages
          .filter(img => img.id !== selectedImage.id)
          .slice(0, 8)
          .map(img => ({
            id: img.id,
            title: img.title,
            url: img.imageUrl,
            tags: img.style.map(s => ({ id: s, name: s, slug: s.toLowerCase() })),
          }));
        setSimilarImages(fallbacks);
        setLoadingSimilar(false);
      });
  }, [selectedImage?.id]);

  useEffect(() => {
    if (!selectedImage) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
      if (e.key === 'ArrowRight' && currentIndex < allImages.length - 1) setSelectedImage(allImages[currentIndex + 1]);
      if (e.key === 'ArrowLeft' && currentIndex > 0) setSelectedImage(allImages[currentIndex - 1]);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [selectedImage, currentIndex, allImages]);

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedImage]);

  if (!selectedImage) return null;

  const isSaved = savedImageIds.includes(selectedImage.id);

  const handleCopy = async () => {
    navigator.clipboard.writeText(selectedImage.prompt);
    setCopied(true);
    toast.success('Prompt copied!');
    try { await fetch(`${API_BASE}/api/images/${selectedImage.id}/copy`, { method: 'POST' }); } catch { }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikeCount(prev => prev + 1);
    try {
      let fp = localStorage.getItem('dough_affair_fp');
      if (!fp) { fp = Math.random().toString(36).substr(2) + Date.now().toString(36); localStorage.setItem('dough_affair_fp', fp); }
      await fetch(`${API_BASE}/api/images/${selectedImage.id}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fingerprint: fp }) });
    } catch { }
  };

  const handleSave = () => {
    toggleSavedImage(selectedImage.id);
    toast(isSaved ? 'Removed from board' : 'Saved to board', { icon: isSaved ? '🗑️' : '✅' });
  };

  const handleSimilarClick = (simImg: SimilarImage) => {
    // Try to find in local store first
    const local = allImages.find(img => img.id === simImg.id);
    if (local) {
      setSelectedImage(local);
    } else {
      // Map API image to local format
      const mapped: ImageItem = {
        id: simImg.id,
        imageUrl: simImg.url,
        title: simImg.title,
        model: '',
        style: simImg.tags?.map(t => t.name) || [],
        prompt: '',
        likes: 0,
        copies: 0,
        width: 800,
        height: 1000,
      };
      setSelectedImage(mapped);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-bg/60 backdrop-blur-md flex items-center justify-center p-4"
        onClick={() => setSelectedImage(null)}
      >
        {/* Main content */}
        <div
          className="bg-surface border border-ink/10 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left: Full-screen image */}
          <div className="relative w-full lg:w-1/2 bg-bg flex items-center justify-center min-h-[250px] max-h-[40vh] md:min-h-[300px] lg:max-h-none shrink-0 overflow-hidden">
            {/* Close button (Mobile) */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-bg/60 text-ink rounded-full hover:bg-bg backdrop-blur-md transition-colors lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Navigation arrows */}
            {currentIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedImage(allImages[currentIndex - 1]); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-bg/60 hover:bg-bg text-ink rounded-full backdrop-blur-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {currentIndex < allImages.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedImage(allImages[currentIndex + 1]); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-bg/60 hover:bg-bg text-ink rounded-full backdrop-blur-md transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <motion.img
              key={selectedImage.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Right: Details panel — slides in from right */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="flex-1 bg-surface border-l border-ink/10 flex flex-col overflow-y-auto custom-scrollbar shrink-0 relative"
          >
            <div className="p-6 lg:p-8 flex flex-col gap-6 flex-1">
              {/* Close button (Desktop) */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 p-2 bg-ink/5 text-ink/60 rounded-full hover:bg-ink/10 hover:text-ink transition-colors hidden lg:flex"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title */}
              <div>
                <h2 className="text-2xl lg:text-3xl font-serif text-ink mb-3 leading-tight">{selectedImage.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-ink text-bg border border-ink text-[10px] font-bold tracking-widest uppercase">
                    {selectedImage.model}
                  </span>
                  {selectedImage.style.map(s => (
                    <span key={s} className="px-3 py-1 bg-transparent text-ink/60 border border-ink/20 text-[10px] font-bold tracking-widest uppercase">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest font-bold transition-all border",
                    liked
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-surface text-ink/60 border-ink/10 hover:text-red-400 hover:border-red-500/20"
                  )}
                >
                  <Heart className={cn("w-4 h-4", liked && "fill-current")} />
                  {likeCount.toLocaleString()}
                </button>
                <button
                  onClick={handleSave}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest font-bold transition-all border",
                    isSaved
                      ? "bg-ink text-bg border-ink"
                      : "bg-surface text-ink/60 border-ink/10 hover:text-ink hover:border-ink/30"
                  )}
                >
                  <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>

              {/* Prompt */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-widest flex items-center gap-2">
                    <PenTool className="w-3.5 h-3.5" /> Prompt
                  </h3>
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold tracking-widest uppercase transition-all border",
                      copied
                        ? "bg-ink text-bg border-ink"
                        : "bg-transparent text-ink/60 hover:text-ink border-ink/10 hover:border-ink/20"
                    )}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="bg-ink/5 border border-ink/10 rounded-lg p-4 font-mono text-sm leading-relaxed text-ink/80">
                  <TypewriterText text={selectedImage.prompt} />
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={() => { setSelectedImage(null); navigate('/builder'); }}
                  className="w-full bg-ink hover:bg-ink/80 text-bg text-xs font-bold tracking-widest uppercase py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <PenTool className="w-4 h-4" /> Use in Builder
                </button>
                <button
                  onClick={() => { setSelectedImage(null); navigate('/converter'); }}
                  className="w-full bg-transparent hover:bg-ink/5 border border-ink/20 text-ink text-xs font-bold tracking-widest uppercase py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Use Style
                </button>
              </div>

              {/* Similar Images */}
              <div className="flex flex-col gap-3 pt-2">
                <h3 className="text-xs font-bold text-ink uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Similar
                </h3>
                {loadingSimilar ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="aspect-square bg-ink/5 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : similarImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {similarImages.map(sim => (
                      <button
                        key={sim.id}
                        onClick={() => handleSimilarClick(sim)}
                        className="group/sim relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-ink/40 transition-all"
                      >
                        <img
                          src={sim.url}
                          alt={sim.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/sim:scale-110"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent opacity-0 group-hover/sim:opacity-100 transition-opacity flex items-end p-2">
                          <span className="text-[10px] font-mono text-ink truncate">{sim.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink/30 font-mono">No similar images found</p>
                )}
              </div>

              {/* Counter */}
              <div className="text-center pt-2">
                <span className="font-mono text-[10px] text-ink/30 uppercase tracking-widest">
                  {currentIndex + 1} / {allImages.length}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}<span className="animate-pulse ml-1 inline-block w-2 h-4 bg-ink align-middle"></span></span>;
}
