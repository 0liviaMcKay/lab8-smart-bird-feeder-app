import type { MediaCatalog, MediaItem } from '../types/media';

const demoPhotos: MediaItem[] = [
  {
    id: 'demo-photo-1',
    kind: 'photo',
    title: 'Cardinal at feeder',
    url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-photo-2',
    kind: 'photo',
    title: 'Bird feeder snapshot',
    url: 'https://images.unsplash.com/photo-1501706362039-c6e809482d5d?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501706362039-c6e809482d5d?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date().toISOString(),
  },
];

const demoVideos: MediaItem[] = [
  {
    id: 'demo-video-1',
    kind: 'video',
    title: 'Feeder activity clip',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 10,
    createdAt: new Date().toISOString(),
  },
];

export async function fetchMediaCatalog(catalogUrl: string, demoMode: boolean): Promise<MediaCatalog> {
  if (catalogUrl.trim()) {
    const response = await fetch(catalogUrl);
    if (!response.ok) {
      throw new Error(`Media catalog request failed: ${response.status}`);
    }

    const payload = (await response.json()) as Partial<MediaCatalog>;
    return {
      photos: payload.photos ?? [],
      videos: payload.videos ?? [],
    };
  }

  if (demoMode) {
    return {
      photos: demoPhotos,
      videos: demoVideos,
    };
  }

  return {
    photos: [],
    videos: [],
  };
}

export function normalizeMediaUrl(mediaBaseUrl: string, url: string): string {
  if (!mediaBaseUrl.trim() || /^https?:\/\//i.test(url)) {
    return url;
  }

  return new URL(url.replace(/^\//, ''), mediaBaseUrl).toString();
}
