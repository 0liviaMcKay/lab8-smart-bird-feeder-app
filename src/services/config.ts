export interface AppConfig {
  appName: string;
  mqttUrl: string;
  mqttCommandTopic: string;
  mqttStatusTopic: string;
  mqttEventTopic: string;
  liveKitUrl: string;
  liveKitRoomName: string;
  liveKitToken: string;
  liveKitTokenUrl: string;
  mediaCatalogUrl: string;
  mediaBaseUrl: string;
  demoMode: boolean;
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  return value.toLowerCase() === 'true';
}

function readString(value: string | undefined, fallback = ''): string {
  return value?.trim() || fallback;
}

export function getAppConfig(): AppConfig {
  return {
    appName: readString(import.meta.env.VITE_APP_NAME, 'Smart Bird Feeder'),
    mqttUrl: readString(import.meta.env.VITE_MQTT_URL, 'ws://localhost:9001/mqtt'),
    mqttCommandTopic: readString(import.meta.env.VITE_MQTT_COMMAND_TOPIC, 'smartbirdfeeder/device/command'),
    mqttStatusTopic: readString(import.meta.env.VITE_MQTT_STATUS_TOPIC, 'smartbirdfeeder/device/status'),
    mqttEventTopic: readString(import.meta.env.VITE_MQTT_EVENT_TOPIC, 'smartbirdfeeder/device/event'),
    liveKitUrl: readString(import.meta.env.VITE_LIVEKIT_URL, ''),
    liveKitRoomName: readString(import.meta.env.VITE_LIVEKIT_ROOM_NAME, 'bird-feeder-live'),
    liveKitToken: readString(import.meta.env.VITE_LIVEKIT_TOKEN, ''),
    liveKitTokenUrl: readString(import.meta.env.VITE_LIVEKIT_TOKEN_URL, ''),
    mediaCatalogUrl: readString(import.meta.env.VITE_MEDIA_CATALOG_URL, ''),
    mediaBaseUrl: readString(import.meta.env.VITE_MEDIA_BASE_URL, ''),
    demoMode: readBoolean(import.meta.env.VITE_DEMO_MODE, true),
  };
}
