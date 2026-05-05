// Shared types and constants — no mock data

export interface ImageItem {
  id: string;
  imageUrl: string;
  title: string;
  model: string;
  style: string[];       // mapped from tags
  prompt: string;
  likes: number;
  copies: number;
  width: number;
  height: number;
  is_published?: boolean;
  created_at?: string;
}

/** Map an API image row to the frontend ImageItem shape */
export function mapApiImage(row: any): ImageItem {
  const tags = Array.isArray(row.tags)
    ? row.tags.map((t: any) => t.name || t)
    : [];

  return {
    id: row.id,
    imageUrl: row.url,
    title: row.title,
    model: row.model,
    style: tags,
    prompt: row.prompt,
    likes: row.like_count ?? 0,
    copies: row.copy_count ?? 0,
    width: 800,
    height: 1000,
    is_published: row.is_published,
    created_at: row.created_at,
  };
}

export const CATEGORIES = [
  "All", "Space", "Cyberpunk", "Nature", "Fantasy", "Abstract",
  "Sci-Fi", "Steampunk", "Landscape", "Surreal", "Character",
  "Neon", "Modern", "Retro", "Color", "Ethereal", "City", "Robot",
  "Cinematic",
];
