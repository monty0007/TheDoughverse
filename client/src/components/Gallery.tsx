import React from 'react';
import { API_BASE } from '../lib/api';
import { motion } from 'motion/react';
import { useGalleryStore } from '../store/useGalleryStore';
import { ImageItem } from '../data/mockData';
import { Heart, Maximize2, Copy, Bookmark, Check, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

interface GalleryProps {
  images?: ImageItem[];
}

export function Gallery({ images: providedImages }: GalleryProps = {}) {
  const { getFilteredImages, setSelectedImage, fetchImages, isLoading, hasMore } = useGalleryStore();
  const displayImages = providedImages ?? getFilteredImages();
  const loaderRef = useRef<HTMLDivElement>(null);
  const useInfiniteScroll = !providedImages;

  // Initial load
  useEffect(() => {
    if (!useInfiniteScroll) return;
    fetchImages(true);
  }, [fetchImages, useInfiniteScroll]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    fetchImages();
  }, [isLoading, hasMore, fetchImages]);

  useEffect(() => {
    if (!useInfiniteScroll) return;
    const sentinel = loaderRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, useInfiniteScroll]);

  if (displayImages.length === 0 && !isLoading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center text-ink/40">
        <p className="font-mono text-sm uppercase tracking-widest">No images found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="masonry-grid px-4 sm:px-6 lg:px-8 w-full py-12">
        {displayImages.map((img, index) => (
          <GalleryItem key={img.id} image={img} index={index} onClick={() => setSelectedImage(img)} />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={loaderRef} className="flex items-center justify-center py-12">
        {useInfiniteScroll && isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 text-ink/40"
          >
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-mono text-[10px] uppercase tracking-widest">Loading more...</span>
          </motion.div>
        )}
        {useInfiniteScroll && !hasMore && displayImages.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-[10px] uppercase tracking-widest text-ink/30"
          >
            — You've seen it all —
          </motion.p>
        )}
      </div>
    </div>
  );
}

function GalleryItem({ image, index, onClick }: { key?: React.Key; image: ImageItem; index: number; onClick: () => void }) {
  const { savedImageIds, toggleSavedImage } = useGalleryStore();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(image.likes);
  const isSaved = savedImageIds.includes(image.id);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(image.prompt);
    setCopied(true);
    toast.success('Prompt copied!');
    // Track copy on server
    try {
      await fetch(`${API_BASE}/api/images/${image.id}/copy`, { method: 'POST' });
    } catch { /* silent */ }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) return;
    setLiked(true);
    setLikeCount(prev => prev + 1);
    try {
      await fetch(`${API_BASE}/api/images/${image.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: getFingerprint() }),
      });
    } catch { /* silent */ }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSavedImage(image.id);
    if (!isSaved) {
      toast.success('Saved to board');
    } else {
      toast('Removed from board', { icon: '🗑️' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98], delay: (index % 3) * 0.1 }}
      className="masonry-item relative group cursor-pointer overflow-hidden bg-surface border border-ink/10 rounded-xl"
      onClick={onClick}
    >
      <img
        src={image.imageUrl}
        alt={image.title}
        className="w-full h-auto object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.21,0.47,0.32,0.98)] group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />

      {/* Top Actions Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 z-10 bg-gradient-to-b from-bg/60 to-transparent">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className={cn(
              "p-2.5 border backdrop-blur-sm transition-colors",
              isSaved ? "bg-ink text-bg border-ink" : "border-ink/20 hover:bg-ink text-ink hover:text-bg"
            )}
            title={isSaved ? "Remove from board" : "Save to board"}
          >
            <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
          </button>
          <button
            onClick={handleLike}
            className={cn(
              "p-2.5 border backdrop-blur-sm transition-colors",
              liked ? "bg-red-500 text-white border-red-500" : "border-ink/20 hover:bg-red-500/20 text-ink hover:text-red-400"
            )}
            title="Like"
          >
            <Heart className={cn("w-4 h-4", liked && "fill-current")} />
          </button>
        </div>
        <button
          onClick={handleCopy}
          className="p-2.5 border border-ink/20 hover:bg-ink text-ink hover:text-bg backdrop-blur-sm transition-colors"
          title="Quick copy prompt"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 pointer-events-none group-hover:pointer-events-auto">
        <div className="flex justify-between items-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.21,0.47,0.32,0.98)]">
          <div className="flex-1 pr-4">
            <h3 className="text-ink font-serif text-2xl font-medium tracking-wide mb-2 line-clamp-1">{image.title}</h3>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] uppercase tracking-widest font-mono border border-ink/20 text-ink/80 px-2 py-1 backdrop-blur-sm">
                {image.model}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-mono text-ink/60 flex items-center gap-1">
                <Heart className={cn("w-3 h-3", liked && "fill-current text-red-400")} /> {likeCount.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="px-4 py-2.5 border border-ink/20 hover:bg-ink text-ink hover:text-bg backdrop-blur-sm transition-colors text-[10px] uppercase tracking-widest font-bold font-mono flex items-center gap-2">
              <Maximize2 className="w-3.5 h-3.5" /> Get Prompt
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Simple fingerprint for like dedup */
function getFingerprint(): string {
  let fp = localStorage.getItem('dough_affair_fp');
  if (!fp) {
    fp = Math.random().toString(36).substr(2) + Date.now().toString(36);
    localStorage.setItem('dough_affair_fp', fp);
  }
  return fp;
}
