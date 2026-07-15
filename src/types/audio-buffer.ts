export interface CachedVoice {
  id: string;
  name: string;
  provider: string;
  bufferCount: number;
}

export interface AudioBufferEntry {
  id: string;
  voiceId: string;
  text: string;
  durationSeconds: number;
  sizeKb: number;
  cachedAt: string;
}

export interface AudioBufferCacheData {
  voices: CachedVoice[];
  buffers: AudioBufferEntry[];
}
