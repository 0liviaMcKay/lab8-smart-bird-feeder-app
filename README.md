# Lab 8 Smart Bird Feeder App

Mobile-first control and monitoring dashboard for the Lab 7 smart bird feeder backend.

## Features
- MQTT command buttons for photo capture, video recording, and live stream control
- LiveKit stream viewer for the feeder camera feed
- Cloud media browser for photos and recorded videos
- Photo and video preview playback
- Device/cloud event log for real-time feedback

## Configuration
Set environment variables in a Vite `.env` file:

- `VITE_MQTT_URL`
- `VITE_MQTT_COMMAND_TOPIC`
- `VITE_MQTT_STATUS_TOPIC`
- `VITE_MQTT_EVENT_TOPIC`
- `VITE_LIVEKIT_URL`
- `VITE_LIVEKIT_ROOM_NAME`
- `VITE_LIVEKIT_TOKEN`
- `VITE_LIVEKIT_TOKEN_URL`
- `VITE_MEDIA_CATALOG_URL`
- `VITE_MEDIA_BASE_URL`
- `VITE_DEMO_MODE`

## Run
```bash
npm install
npm run dev
```

## Notes
- The app uses browser MQTT over WebSocket.
- Media browsing is designed to use a backend catalog that returns S3 or pre-signed URLs.
- LiveKit can use a direct token or a token service endpoint.
- Because Lab 7 is still in progress, keep backend values in `.env` and update them as the ESP32-P4, MQTT, LiveKit, and cloud paths settle.
