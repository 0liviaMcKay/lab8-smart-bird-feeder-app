import type { MediaItem } from '../types/media';

interface MediaPreviewProps {
  item: MediaItem | null;
  onClose: () => void;
}

export function MediaPreview({ item, onClose }: MediaPreviewProps) {
  if (!item) {
    return null;
  }

  return (
    <section className="preview-panel">
      <div className="preview-panel__header">
        <div>
          <p className="eyebrow">Preview</p>
          <h3>{item.title}</h3>
        </div>
        <button className="secondary-button" onClick={onClose} type="button">
          Close
        </button>
      </div>
      {item.kind === 'photo' ? (
        <img alt={item.title} className="preview-panel__media" src={item.url} />
      ) : (
        <video className="preview-panel__media" controls src={item.url} />
      )}
      <div className="preview-panel__meta">
        <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Unknown time'}</span>
        {item.durationSeconds ? <span>{item.durationSeconds}s</span> : null}
      </div>
    </section>
  );
}
