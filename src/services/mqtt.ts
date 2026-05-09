import mqtt, { type MqttClient } from 'mqtt';

export type BirdFeederCommand =
  | 'capture_photo'
  | 'start_video_recording'
  | 'stop_video_recording'
  | 'start_live_stream'
  | 'stop_live_stream';

export interface CommandMessage {
  source: 'smartphone-app';
  command: BirdFeederCommand;
  timestamp: string;
  requestId: string;
}

export interface DeviceEventMessage {
  type?: string;
  message?: string;
  mediaUrl?: string;
  mediaKind?: 'photo' | 'video';
  [key: string]: unknown;
}

export function buildCommandMessage(command: BirdFeederCommand): CommandMessage {
  return {
    source: 'smartphone-app',
    command,
    timestamp: new Date().toISOString(),
    requestId: globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}`,
  };
}

export function connectMqtt(url: string): MqttClient {
  return mqtt.connect(url, {
    reconnectPeriod: 2000,
    connectTimeout: 10_000,
    clean: true,
  });
}
