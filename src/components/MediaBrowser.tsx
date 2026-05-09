import type { MediaItem } from '../types/media';
import { normalizeMediaUrl } from '../services/media';

interface MediaBrowserProps {
  photos: MediaItem[];
  videos: MediaItem[];
  mediaBaseUrl: string;
  onSelect: (item: MediaItem) => void;
}

export function MediaBrowser({ photos, videos, mediaBaseUrl, onSelect }: MediaBrowserProps) {
  return (
    <section className="card">
      <div className="card__header">
        <div>
          <p className="eyebrow">Cloud Media</p>
          <h2>Photo and Video Library</h2>
        </div>
      </div>

      <div className="media-section">
        <h3>Photos</h3>
        <div className="media-grid">
          {photos.length > 0 ? (
            photos.map((item) => (
              <button className="media-card" key={item.id} onClick={() => onSelect(item)} type="button">
                <img alt={item.title} src={normalizeMediaUrl(mediaBaseUrl, item.thumbnailUrl ?? item.url)} />
                <span>{item.title}</span>
              </button>
            ))
          ) : (
            <p className="empty-state">No photos yet. Trigger a capture to populate the cloud gallery.</p>
          )}
        </div>
      </div>

      <div className="media-section">
        <h3>Videos</h3>
        <div className="media-grid media-grid--videos">
          {videos.length > 0 ? (
            videos.map((item) => (
              <button className="media-card media-card--video" key={item.id} onClick={() => onSelect(item)} type="button">
                <img alt={item.title} src={normalizeMediaUrl(mediaBaseUrl, item.thumbnailUrl ?? item.url)} />
                <span>{item.title}</span>
              </button>
            ))
          ) : (
            <p className="empty-state">No recordings yet. Start a video session to populate the video list.</p>
          )}
        </div>
      </div>
    </section>
  );
}
