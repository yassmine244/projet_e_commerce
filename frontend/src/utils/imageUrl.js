// Resolve a product image to a fully-qualified URL.
// - http(s) URL → returned as-is (e.g. Unsplash CDN)
// - /uploads/foo.jpg → prefixed with backend host (strip /api from VITE_API_URL)
// - empty / null → local placeholder
const apiBase = import.meta.env.VITE_API_URL || '';
const HOST = apiBase.replace(/\/api\/?$/, '');

export const PLACEHOLDER = '/placeholder.svg';

export const imageUrl = (path) => {
  if (!path) return PLACEHOLDER;
  if (/^https?:\/\//i.test(path)) return path;
  return `${HOST}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Use as: <img onError={onImageError} .../>
export const onImageError = (e) => {
  if (e.currentTarget.src.endsWith(PLACEHOLDER)) return; // already on fallback
  e.currentTarget.onerror = null;
  e.currentTarget.src = PLACEHOLDER;
};
