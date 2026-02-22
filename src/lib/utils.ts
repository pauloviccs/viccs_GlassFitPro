import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getYoutubeThumbnail(url: string | undefined | null, fallback: string = ''): string {
  if (!url) return fallback;
  
  try {
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : fallback;
    }
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get('v');
      return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : fallback;
    }
    if (url.includes('youtube.com/embed/')) {
      const id = url.split('youtube.com/embed/')[1]?.split('?')[0];
      return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : fallback;
    }
  } catch {
    return fallback;
  }
  
  return fallback;
}
