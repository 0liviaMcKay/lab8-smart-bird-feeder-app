declare module 'react' {
  export type ReactNode = unknown;
  export type ReactElement = unknown;
  export type FC<P = Record<string, unknown>> = (props: P) => ReactElement | null;
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: unknown[]): T;
  export function useRef<T>(initialValue: T | null): { current: T | null };
  export function useState<T>(initialValue: T): [T, (value: T | ((current: T) => T)) => void];
  const React: unknown;
  export default React;
}

declare module 'react-dom/client' {
  export function createRoot(container: HTMLElement): {
    render(node: unknown): void;
  };
}

declare module 'mqtt' {
  export interface MqttClient {
    on(event: string, handler: (...args: unknown[]) => void): void;
    subscribe(topics: string[], callback?: (error?: Error | null) => void): void;
    publish(topic: string, message: string, options: { qos: number }, callback?: (error?: Error | null) => void): void;
    end(force?: boolean): void;
  }
  export default function mqttConnect(url: string, options?: Record<string, unknown>): MqttClient;
}

declare module 'livekit-client' {
  export class Room {
    remoteParticipants: Map<string, any>;
    constructor(options?: Record<string, unknown>);
    connect(url: string, token: string, options?: Record<string, unknown>): Promise<void>;
    disconnect(): void;
    on(event: string, handler: (...args: unknown[]) => void): void;
    off(event: string, handler: (...args: unknown[]) => void): void;
  }

  export enum RoomEvent {
    TrackSubscribed = 'TrackSubscribed',
    TrackUnsubscribed = 'TrackUnsubscribed',
  }

  export class Track {
    static Kind: { Video: string };
    kind: string;
    attach(element: HTMLVideoElement): void;
    detach(element: HTMLVideoElement): void;
  }
}

export {};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}
