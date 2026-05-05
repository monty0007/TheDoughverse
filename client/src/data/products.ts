export interface CookieProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  badge?: 'NEW' | 'BESTSELLER' | 'SEASONAL' | 'LIMITED';
  is_limited?: boolean;
  quantity?: number | null;
}

export const COOKIE_CATEGORIES = [
  'All', 'Classic', 'Chocolate', 'Specialty',
];

export const COOKIE_PRODUCTS: CookieProduct[] = [
  {
    id: '1',
    name: 'Classic Chocolate Chip',
    description: 'Buttery dough loaded with dark & milk chocolate chunks, baked to a golden crisp.',
    price: 150,
    image: 'https://images.pexels.com/photos/5847103/pexels-photo-5847103.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Classic',
    badge: 'BESTSELLER',
  },
  {
    id: '2',
    name: 'Butter Crunch Cookie',
    description: 'Simple, melt-in-your-mouth butter cookie with a golden crisp edge and soft centre.',
    price: 120,
    image: 'https://images.pexels.com/photos/797761/pexels-photo-797761.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Classic',
  },
  {
    id: '3',
    name: 'Double Chocolate Cookie',
    description: 'Rich dark cocoa cookie loaded with chocolate chips — for serious chocolate lovers.',
    price: 180,
    image: 'https://images.pexels.com/photos/5836532/pexels-photo-5836532.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Chocolate',
    badge: 'BESTSELLER',
  },
  {
    id: '4',
    name: 'Oatmeal Raisin Cookie',
    description: 'Chewy oats, plump raisins and warm cinnamon in every homemade bite.',
    price: 140,
    image: 'https://images.pexels.com/photos/4110538/pexels-photo-4110538.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Classic',
  },
  {
    id: '5',
    name: 'Peanut Butter Cookie',
    description: 'Thick, chewy peanut butter cookie with a crumbly fork-pressed top.',
    price: 160,
    image: 'https://images.pexels.com/photos/310575/pexels-photo-310575.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Classic',
    badge: 'NEW',
  },
  {
    id: '6',
    name: 'White Chocolate Macadamia',
    description: 'Creamy white chocolate chips and crunchy macadamia nuts in a soft, chewy cookie.',
    price: 200,
    image: 'https://images.pexels.com/photos/5836519/pexels-photo-5836519.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Specialty',
    badge: 'NEW',
  },
  {
    id: '7',
    name: 'Snickerdoodle',
    description: 'Soft vanilla cookie rolled in cinnamon sugar — warm, cozy and addictive.',
    price: 140,
    image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Classic',
  },
  {
    id: '8',
    name: 'Triple Chocolate Chunk',
    description: 'Dark cocoa dough with white, milk and dark chocolate chunks in every bite.',
    price: 220,
    image: 'https://images.pexels.com/photos/5846039/pexels-photo-5846039.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Chocolate',
    badge: 'LIMITED',
  },
];
