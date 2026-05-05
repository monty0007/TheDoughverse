import { COOKIE_PRODUCTS } from '../data/products';

type ProductImageSource = {
  id?: string;
  name?: string;
  category?: string;
  image?: string | null;
};

const normalizeName = (value = '') =>
  value
    .toLowerCase()
    .replace(/\bcookies?\b/g, '')
    .replace(/[^a-z0-9]/g, '');

const FALLBACK_BY_ID = new Map(COOKIE_PRODUCTS.map((product) => [product.id, product.image]));
const FALLBACK_BY_NAME = new Map(
  COOKIE_PRODUCTS.flatMap((product) => [
    [normalizeName(product.name), product.image],
    [normalizeName(product.name.replace(/\bcookies?\b/gi, '')), product.image],
  ])
);

export const DEFAULT_PRODUCT_IMAGE = COOKIE_PRODUCTS[0]?.image ?? '';

export function getFallbackProductImage(product: ProductImageSource): string {
  if (product.id && FALLBACK_BY_ID.has(product.id)) {
    return FALLBACK_BY_ID.get(product.id) || DEFAULT_PRODUCT_IMAGE;
  }

  const normalized = normalizeName(product.name);
  if (normalized && FALLBACK_BY_NAME.has(normalized)) {
    return FALLBACK_BY_NAME.get(normalized) || DEFAULT_PRODUCT_IMAGE;
  }

  const fuzzyMatch = COOKIE_PRODUCTS.find((fallback) => {
    const fallbackName = normalizeName(fallback.name);
    return normalized && (fallbackName.includes(normalized) || normalized.includes(fallbackName));
  });
  if (fuzzyMatch) return fuzzyMatch.image;

  const categoryMatch = COOKIE_PRODUCTS.find((fallback) => fallback.category === product.category);
  return categoryMatch?.image || DEFAULT_PRODUCT_IMAGE;
}

export function getProductImage(product: ProductImageSource): string {
  return product.image?.trim() || getFallbackProductImage(product);
}
