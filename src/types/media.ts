export type MediaKind = 'photo' | 'video';

export interface MediaItem {
  id: string;
  kind: MediaKind;
  title: string;
  url: string;
  thumbnailUrl?: string;
  createdAt?: string;
  durationSeconds?: number;
}

export interface MediaCatalog {
  photos: MediaItem[];
  videos: MediaItem[];
}
