import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getApiOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) return 'http://localhost:5000';
  if (apiUrl.startsWith('/')) return '';
  return apiUrl.replace(/\/api\/?$/, '');
}

export function getImageUrl(path) {
  if (!path) return 'https://placehold.co/600x400/2a2a35/ffffff.png?text=Course+Thumbnail';
  if (path.startsWith('http')) return path;
  return `${getApiOrigin()}${path}`;
}
