import { useEffect, useMemo, useRef, useState } from 'react';
import type { MqttClient } from 'mqtt';
import { CommandPanel } from './components/CommandPanel';
import { MediaBrowser } from './components/MediaBrowser';
import { MediaPreview } from './components/MediaPreview';
import { StatusPill } from './components/StatusPill';
import { getAppConfig } from './services/config';
import { attachLiveVideo, connectLiveKit, resolveLiveKitToken } from './services/livekit';
import { buildCommandMessage, connectMqtt, type BirdFeederCommand, type DeviceEventMessage } from './services/mqtt';
import { fetchMediaCatalog, normalizeMediaUrl } from './services/media';
import type { MediaItem } from './types/media';
import { Room } from 'livekit-client';

interface LogEntry {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
}

type MqttStatus = 'connecting' | 'connected' | 'offline' | 'error';
type LiveKitStatus = 'idle' | 'connecting' | 'connected' | 'error';

const config = getAppConfig();

function formatStatusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

function createLog(title: string, detail: string): LogEntry {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `log-${Date.now()}`,
    title,
    detail,
    timestamp: new Date().toISOString(),
  };
}

export default function App() {
  const [mqttStatus, setMqttStatus] = useState<MqttStatus>('connecting');
  const [busyCommand, setBusyCommand] = useState<BirdFeederCommand | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([createLog('App ready', 'Waiting for MQTT and LiveKit connections.')]);
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [liveKitStatus, setLiveKitStatus] = useState<LiveKitStatus>('idle');
  const [liveKitMessage, setLiveKitMessage] = useState('Live stream not connected yet.');
  const [liveKitTokenStatus, setLiveKitTokenStatus] = useState('Ready to resolve credentials.');

  const mqttClientRef = useRef<MqttClient | null>(null);
  const roomRef = useRef<Room | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const liveVideoCleanupRef = useRef<(() => void) | null>(null);

  const mediaBaseUrl = useMemo(() => config.mediaBaseUrl, []);

  useEffect(() => {
    let cancelled = false;

    fetchMediaCatalog(config.mediaCatalogUrl, config.demoMode)
      .then((catalog) => {
        if (cancelled) {
          return;
        }
        setPhotos(catalog.photos);
        setVideos(catalog.videos);
      })
      .catch((error: Error) => {
        setLogs((current: LogEntry[]) => [createLog('Media catalog error', error.message), ...current].slice(0, 8));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const client = connectMqtt(config.mqttUrl);
    mqttClientRef.current = client;

    client.on('connect', () => {
      setMqttStatus('connected');
      setLogs((current: LogEntry[]) => [createLog('MQTT connected', `Connected to ${config.mqttUrl}`), ...current].slice(0, 8));
      client.subscribe([config.mqttStatusTopic, config.mqttEventTopic]);
    });

    client.on('reconnect', () => setMqttStatus('connecting'));
    client.on('offline', () => setMqttStatus('offline'));
    client.on('error', (error: Error) => {
      setMqttStatus('error');
      setLogs((current: LogEntry[]) => [createLog('MQTT error', String(error)), ...current].slice(0, 8));
    });
    client.on('message', (topic: string, payload: unknown) => {
      const rawMessage = typeof payload === 'string'
        ? payload
        : payload instanceof Uint8Array
          ? new TextDecoder().decode(payload)
          : String(payload);
      let parsedMessage: DeviceEventMessage | null = null;

      try {
        parsedMessage = JSON.parse(rawMessage) as DeviceEventMessage;
      } catch {
        parsedMessage = { message: rawMessage };
      }

      const title = topic === config.mqttStatusTopic ? 'Device status' : 'Device event';
      const detail = parsedMessage?.message ?? rawMessage;
      setLogs((current: LogEntry[]) => [createLog(title, `${topic}: ${detail}`), ...current].slice(0, 8));

      if (parsedMessage?.mediaKind === 'photo' && parsedMessage.mediaUrl) {
        const photo: MediaItem = {
          id: parsedMessage.mediaUrl,
          kind: 'photo',
          title: parsedMessage.message ?? 'Captured photo',
          url: normalizeMediaUrl(mediaBaseUrl, parsedMessage.mediaUrl),
          createdAt: new Date().toISOString(),
        };
        setPhotos((current: MediaItem[]) => [photo, ...current.filter((item: MediaItem) => item.id !== photo.id)].slice(0, 12));
      }

      if (parsedMessage?.mediaKind === 'video' && parsedMessage.mediaUrl) {
        const video: MediaItem = {
          id: parsedMessage.mediaUrl,
          kind: 'video',
          title: parsedMessage.message ?? 'Recorded video',
          url: normalizeMediaUrl(mediaBaseUrl, parsedMessage.mediaUrl),
          createdAt: new Date().toISOString(),
        };
        setVideos((current: MediaItem[]) => [video, ...current.filter((item: MediaItem) => item.id !== video.id)].slice(0, 12));
      }
    });

    return () => {
      client.end(true);
      mqttClientRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function connectStream() {
      if (!config.liveKitUrl.trim()) {
        setLiveKitStatus(config.demoMode ? 'connected' : 'idle');
        setLiveKitMessage(config.demoMode ? 'Demo mode active. Use the media browser to preview sample footage.' : 'Configure LiveKit to view the feeder stream.');
        return;
      }

      setLiveKitStatus('connecting');
      try {
        const token = await resolveLiveKitToken(config.liveKitToken, config.liveKitTokenUrl);
        if (cancelled) {
          return;
        }
        if (!token) {
          throw new Error('LiveKit token is empty.');
        }
        setLiveKitTokenStatus('LiveKit token resolved successfully.');
        const room = await connectLiveKit({
          url: config.liveKitUrl,
          roomName: config.liveKitRoomName,
          token,
        });
        if (cancelled) {
          room.disconnect();
          return;
        }
        roomRef.current = room;
        liveVideoCleanupRef.current?.();
        liveVideoCleanupRef.current = attachLiveVideo(room, liveVideoRef.current);
        setLiveKitStatus('connected');
        setLiveKitMessage(`Joined room ${config.liveKitRoomName}.`);
        setLogs((current: LogEntry[]) => [createLog('LiveKit connected', `Joined ${config.liveKitRoomName}`), ...current].slice(0, 8));
      } catch (error) {
        setLiveKitStatus('error');
        setLiveKitMessage(error instanceof Error ? error.message : 'Unable to connect to LiveKit.');
        setLogs((current: LogEntry[]) => [createLog('LiveKit error', error instanceof Error ? error.message : String(error)), ...current].slice(0, 8));
      }
    }

    connectStream();

    return () => {
      cancelled = true;
      liveVideoCleanupRef.current?.();
      liveVideoCleanupRef.current = null;
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, []);

  async function sendCommand(command: BirdFeederCommand) {
    const client = mqttClientRef.current;
    if (!client || mqttStatus !== 'connected') {
      setLogs((current: LogEntry[]) => [createLog('Command blocked', 'MQTT is not connected.'), ...current].slice(0, 8));
      return;
    }

    setBusyCommand(command);
    const message = buildCommandMessage(command);
    client.publish(config.mqttCommandTopic, JSON.stringify(message), { qos: 1 }, (error?: Error | null) => {
      if (error) {
        setLogs((current: LogEntry[]) => [createLog('Publish failed', error.message), ...current].slice(0, 8));
      } else {
        setLogs((current: LogEntry[]) => [createLog('Command sent', `${command} → ${config.mqttCommandTopic}`), ...current].slice(0, 8));
      }
      setBusyCommand(null);
    });
  }

  const selectedTitle = selectedItem?.title ?? 'Select a photo or video';

  return (
    <div className="app-shell">
      <header className="hero card">
        <div>
          <p className="eyebrow">Lab 8 Smartphone App</p>
          <h1>{config.appName}</h1>
          <p className="hero__copy">
            Control the feeder, view LiveKit video, and browse cloud-stored media from a phone-friendly dashboard.
          </p>
        </div>
        <div className="hero__status-row">
          <StatusPill label={formatStatusLabel(mqttStatus)} tone={mqttStatus === 'connected' ? 'good' : mqttStatus === 'error' ? 'bad' : 'warn'} />
          <StatusPill label={formatStatusLabel(liveKitStatus)} tone={liveKitStatus === 'connected' ? 'good' : liveKitStatus === 'error' ? 'bad' : 'neutral'} />
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="card live-panel">
          <div className="card__header">
            <div>
              <p className="eyebrow">Live Video</p>
              <h2>Feeder Stream</h2>
            </div>
            <StatusPill label={selectedTitle} tone="neutral" />
          </div>
          <video ref={liveVideoRef} className="live-video" autoPlay playsInline muted controls={false} />
          <p className="muted-text">{liveKitMessage}</p>
          <p className="muted-text muted-text--small">{liveKitTokenStatus}</p>
        </section>

        <CommandPanel connected={mqttStatus === 'connected'} busyCommand={busyCommand} onCommand={sendCommand} />

        <MediaBrowser photos={photos} videos={videos} mediaBaseUrl={mediaBaseUrl} onSelect={setSelectedItem} />

        <MediaPreview item={selectedItem} onClose={() => setSelectedItem(null)} />

        <section className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">System Interaction</p>
              <h2>Command and Event Log</h2>
            </div>
          </div>
          <div className="log-list">
            {logs.map((entry: LogEntry) => (
              <article className="log-entry" key={entry.id}>
                <div>
                  <strong>{entry.title}</strong>
                  <p>{entry.detail}</p>
                </div>
                <time dateTime={entry.timestamp}>{new Date(entry.timestamp).toLocaleTimeString()}</time>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
