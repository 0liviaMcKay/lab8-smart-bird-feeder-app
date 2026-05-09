# Lab 8 Demo Checklist

This file lists the steps and commands to run and record the Lab 8 smartphone app demo.

1) Prepare environment

- Copy the example env and edit backend values (Lab 7):

```bash
cp .env.example .env.local
# Edit .env.local: set VITE_MQTT_URL, VITE_MQTT_COMMAND_TOPIC, VITE_MQTT_STATUS_TOPIC,
# VITE_MQTT_EVENT_TOPIC, VITE_LIVEKIT_URL, VITE_LIVEKIT_ROOM_NAME, VITE_LIVEKIT_TOKEN or
# VITE_LIVEKIT_TOKEN_URL, VITE_MEDIA_CATALOG_URL, VITE_MEDIA_BASE_URL
```

- For a demo without Lab 7, keep `VITE_DEMO_MODE=true` in `.env.local` to use sample media.

2) Install and run the app

```bash
npm install
# Local dev server (hot reload)
npm run dev
# Or build + preview for a production-like run
npm run build
npm run preview
```

Open the app on a phone or desktop: http://<your-machine-ip>:5173 (dev) or the preview address.

3) Demo tasks to record

- Show commit graph (capture screenshot):

```bash
git --no-pager log --graph --oneline --all
```

- Start screen recording (QuickTime on macOS: File → New Screen Recording).
- In the app: show the following flows while narrating or annotating timestamps:
  - MQTT control: press `Capture Photo`, `Start Video`, `Stop Video`, `Start Live`, `Stop Live` and show the `Command and Event Log` updating.
  - Live video: demonstrate the LiveKit stream panel (requires LiveKit configured in `.env.local`).
  - Cloud media: open `Cloud Media` photos and videos, preview a photo, and play a recorded video.
  - Confirm real-time feedback: show that when a command is sent, the device/cloud sends an event back (appears in the log and media lists).

4) Useful extras

- If your phone is on the same LAN, use the host IP to open the dev server on the device.
- If you need to expose the dev server over the Internet, use `ngrok http 5173` and paste the ngrok URL into the phone browser.

5) Deliverables

- Commit graph screenshot (run the git command above and screenshot the terminal or use the Git GUI).
- Demo video: record the screen performing the demo tasks; include voiceover or on-screen text.

If you want, I can add a small `scripts/demo.sh` to automate starting the server and opening a browser, or help you compose the spoken demo script.
