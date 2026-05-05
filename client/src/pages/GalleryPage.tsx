import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gallery } from '../components/Gallery';
import { ImageModal } from '../components/ImageModal';
import { useGalleryStore } from '../store/useGalleryStore';
import { CATEGORIES } from '../data/mockData';
import { cn } from '../lib/utils';
import { Search, SlidersHorizontal, TrendingUp, Clock, Heart, ChevronDown } from 'lucide-react';

export function GalleryPage() {
  const { activeCategory, setCategory, searchQuery, setSearchQuery, sortBy, setSortBy } = useGalleryStore();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col pt-28 sm:pt-24">
      {/* Header & Search */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-6"
        >
          <div className="w-full text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-serif mb-2">Discover</h1>
            <p className="text-ink/60 font-mono text-xs uppercase tracking-widest break-words whitespace-normal">Explore AI-generated art and prompts</p>
          </div>

          <div className="w-full lg:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <input
              type="text"
              placeholder="Search prompts, styles, or titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-ink/10 rounded-full py-3 pl-12 pr-4 text-sm font-mono placeholder:text-ink/40 focus:outline-none focus:border-ink/30 transition-colors"
            />
          </div>
        </motion.div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-0 z-30 bg-bg/90 backdrop-blur-xl border-y border-ink/5 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">

          {/* Mobile Filter Toggle */}
          <div className="w-full lg:hidden flex flex-col items-start text-left">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-2 rounded-full border border-ink/20 text-ink/80 text-xs font-mono uppercase tracking-widest hover:bg-ink/5 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeCategory}
              <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
            </button>

            {showFilters && (
              <div className="flex flex-wrap justify-start gap-2 mt-4 w-full">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => { setCategory(category); setShowFilters(false); }}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest whitespace-nowrap transition-all duration-300 border",
                      activeCategory === category
                        ? "bg-ink text-bg border-ink"
                        : "bg-transparent text-ink/60 hover:text-ink border-ink/10 hover:border-ink/30"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Filter Bar */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 lg:pb-0 w-full lg:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-ink/40 mr-2 shrink-0" />
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setCategory(category)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest whitespace-nowrap transition-all duration-300 border",
                  activeCategory === category
                    ? "bg-ink text-bg border-ink"
                    : "bg-transparent text-ink/60 hover:text-ink border-ink/10 hover:border-ink/30"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-start lg:justify-end gap-2 shrink-0 w-full overflow-x-auto custom-scrollbar lg:overflow-visible mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-ink/5 pb-2 lg:pb-0">
            <SortButton active={sortBy === 'newest'} onClick={() => setSortBy('newest')} icon={<Clock className="w-3.5 h-3.5" />} label="Newest" />
            <SortButton active={sortBy === 'trending'} onClick={() => setSortBy('trending')} icon={<TrendingUp className="w-3.5 h-3.5" />} label="Trending" />
            <SortButton active={sortBy === 'liked'} onClick={() => setSortBy('liked')} icon={<Heart className="w-3.5 h-3.5" />} label="Most Liked" />
          </div>
        </div>
      </section>

      {/* Gallery */}
      <main className="flex-1 w-full bg-surface/30">
        <Gallery />
      </main>

      {/* Modal */}
      <ImageModal />
    </div>
  );
}

function SortButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all border",
        active
          ? "bg-ink/10 text-ink border-ink/20"
          : "bg-transparent text-ink/50 hover:text-ink border-transparent hover:border-ink/10"
      )}
    >
      {icon} {label}
    </button>
  );
}
