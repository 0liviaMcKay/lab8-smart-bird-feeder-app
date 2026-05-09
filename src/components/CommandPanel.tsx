import type { BirdFeederCommand } from '../services/mqtt';
import { StatusPill } from './StatusPill';

interface CommandPanelProps {
  onCommand: (command: BirdFeederCommand) => void;
  busyCommand: BirdFeederCommand | null;
  connected: boolean;
}

const commandButtons: Array<{ command: BirdFeederCommand; label: string; description: string }> = [
  { command: 'capture_photo', label: 'Capture Photo', description: 'Triggers the ESP32-P4 camera to save a still image.' },
  { command: 'start_video_recording', label: 'Start Video', description: 'Begins cloud-linked recording on the feeder.' },
  { command: 'stop_video_recording', label: 'Stop Video', description: 'Stops the active recording session.' },
  { command: 'start_live_stream', label: 'Start Live', description: 'Turns on the live video stream.' },
  { command: 'stop_live_stream', label: 'Stop Live', description: 'Shuts down the live stream.' },
];

export function CommandPanel({ onCommand, busyCommand, connected }: CommandPanelProps) {
  return (
    <section className="card">
      <div className="card__header">
        <div>
          <p className="eyebrow">MQTT Control</p>
          <h2>Device Commands</h2>
        </div>
        <StatusPill label={connected ? 'MQTT connected' : 'MQTT offline'} tone={connected ? 'good' : 'warn'} />
      </div>
      <div className="button-grid">
        {commandButtons.map(({ command, label, description }) => (
          <button
            key={command}
            className="command-button"
            disabled={!connected || busyCommand !== null}
            onClick={() => onCommand(command)}
            type="button"
          >
            <strong>{label}</strong>
            <span>{description}</span>
            {busyCommand === command ? <em>Sending...</em> : null}
          </button>
        ))}
      </div>
    </section>
  );
}
