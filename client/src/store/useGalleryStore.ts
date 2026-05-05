import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ImageItem, mapApiImage } from '../data/mockData';
import { API_BASE } from '../lib/api';

interface GalleryState {
  images: ImageItem[];
  selectedImage: ImageItem | null;
  activeCategory: string;
  searchQuery: string;
  sortBy: 'newest' | 'liked' | 'trending';
  savedImageIds: string[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;

  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'newest' | 'liked' | 'trending') => void;
  setSelectedImage: (image: ImageItem | null) => void;
  toggleSavedImage: (id: string) => void;
  fetchImages: (reset?: boolean) => Promise<void>;
  getFilteredImages: () => ImageItem[];
  getSavedImages: () => ImageItem[];
  getSimilarImages: (image: ImageItem) => ImageItem[];
}

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set, get) => ({
      images: [],
      selectedImage: null,
      activeCategory: 'All',
      searchQuery: '',
      sortBy: 'newest',
      savedImageIds: [],
      isLoading: false,
      hasMore: true,
      page: 1,

      setCategory: (category) => {
        set({ activeCategory: category, images: [], page: 1, hasMore: true });
        get().fetchImages(true);
      },
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sort) => {
        set({ sortBy: sort, images: [], page: 1, hasMore: true });
        get().fetchImages(true);
      },
      setSelectedImage: (image) => set({ selectedImage: image }),
      toggleSavedImage: (id) => set((state) => ({
        savedImageIds: state.savedImageIds.includes(id)
          ? state.savedImageIds.filter(savedId => savedId !== id)
          : [...state.savedImageIds, id]
      })),

      fetchImages: async (reset = false) => {
        const { isLoading, page, activeCategory, searchQuery, sortBy } = get();
        if (isLoading) return;

        set({ isLoading: true });

        const currentPage = reset ? 1 : page;
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: '20',
          sort: sortBy === 'liked' ? 'most_liked' : sortBy,
        });

        if (activeCategory !== 'All') params.set('tag', activeCategory.toLowerCase());
        if (searchQuery) params.set('search', searchQuery);

        try {
          const res = await fetch(`${API_BASE}/api/images?${params}`);
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Server returned ${res.status}: ${errText}`);
          }
          const data = await res.json();
          const mapped = data.images.map(mapApiImage);

          set({
            images: reset ? mapped : [...get().images, ...mapped],
            page: currentPage + 1,
            hasMore: currentPage < data.pagination.totalPages,
            isLoading: false,
          });
        } catch (err) {
          console.error('Failed to fetch images:', err);
          set({ isLoading: false });
        }
      },

      getFilteredImages: () => {
        const { images, searchQuery } = get();
        if (!searchQuery) return images;
        const q = searchQuery.toLowerCase();
        return images.filter(img =>
          img.title.toLowerCase().includes(q) ||
          img.prompt.toLowerCase().includes(q) ||
          img.style.some(s => s.toLowerCase().includes(q))
        );
      },
      getSavedImages: () => {
        const { images, savedImageIds } = get();
        return images.filter(img => savedImageIds.includes(img.id));
      },
      getSimilarImages: (image) => {
        const { images } = get();
        return images.filter(img =>
          img.id !== image.id &&
          img.style.some(s => image.style.includes(s))
        ).slice(0, 4);
      }
    }),
    {
      name: 'dough-affair-gallery-storage',
      partialize: (state) => ({ savedImageIds: state.savedImageIds }),
    }
  )
);
