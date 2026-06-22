import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(path) {
  if (!path) return 'https://placehold.co/600x400/2a2a35/ffffff.png?text=Course+Thumbnail';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}${path}`;
}
