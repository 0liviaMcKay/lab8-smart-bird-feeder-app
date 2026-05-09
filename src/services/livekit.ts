import { Room, RoomEvent, Track } from 'livekit-client';

export interface LiveKitConnectionInfo {
  url: string;
  roomName: string;
  token: string;
}

export async function resolveLiveKitToken(token: string, tokenUrl: string): Promise<string> {
  if (token.trim()) {
    return token.trim();
  }

  if (!tokenUrl.trim()) {
    return '';
  }

  const response = await fetch(tokenUrl);
  if (!response.ok) {
    throw new Error(`LiveKit token request failed: ${response.status}`);
  }

  const payload = (await response.json()) as { token?: string };
  return payload.token?.trim() ?? '';
}

export async function connectLiveKit(connection: LiveKitConnectionInfo): Promise<Room> {
  const room = new Room({
    adaptiveStream: true,
    dynacast: true,
  });

  await room.connect(connection.url, connection.token, {
    autoSubscribe: true,
    roomName: connection.roomName,
  });

  return room;
}

export function attachLiveVideo(room: Room, videoElement: HTMLVideoElement | null): () => void {
  if (!videoElement) {
    return () => undefined;
  }

  const handleTrackSubscribed = (track: Track) => {
    if (track.kind === Track.Kind.Video) {
      track.attach(videoElement);
    }
  };

  const handleTrackUnsubscribed = (track: Track) => {
    track.detach(videoElement);
  };

  room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
  room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

  const existingVideoTrack = Array.from(room.remoteParticipants.values())
    .flatMap((participant: any) => Array.from(participant.trackPublications.values()) as Array<{ track?: Track }>)
    .find((publication: { track?: Track }) => publication.track?.kind === Track.Kind.Video)?.track;

  existingVideoTrack?.attach(videoElement);

  return () => {
    room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    room.remoteParticipants.forEach((participant: any) => {
      participant.trackPublications.forEach((publication: { track?: Track }) => publication.track?.detach(videoElement));
    });
  };
}
