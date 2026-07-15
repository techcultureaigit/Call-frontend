import type { AudioBufferCacheData } from "@/types/audio-buffer";

function daysAgo(d: number, h = 12): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(h, 0, 0, 0);
  return date.toISOString();
}

export const MOCK_AUDIO_BUFFER_CACHE: AudioBufferCacheData = {
  voices: [
    { id: "voice_aakash", name: "Aakash", provider: "Google", bufferCount: 4 },
    { id: "voice_saras", name: "Saras", provider: "Google", bufferCount: 3 },
    { id: "voice_aadhya", name: "Aadhya", provider: "Open AI", bufferCount: 2 },
  ],
  buffers: [
    {
      id: "buf_001",
      voiceId: "voice_aakash",
      text: "Hello! How can I help you today?",
      durationSeconds: 2.4,
      sizeKb: 48,
      cachedAt: daysAgo(1, 10),
    },
    {
      id: "buf_002",
      voiceId: "voice_aakash",
      text: "Thank you for calling. Please hold while I connect you.",
      durationSeconds: 3.8,
      sizeKb: 72,
      cachedAt: daysAgo(2, 14),
    },
    {
      id: "buf_003",
      voiceId: "voice_aakash",
      text: "Your grievance has been registered successfully.",
      durationSeconds: 2.9,
      sizeKb: 56,
      cachedAt: daysAgo(3, 9),
    },
    {
      id: "buf_004",
      voiceId: "voice_aakash",
      text: "Is there anything else I can assist you with?",
      durationSeconds: 2.1,
      sizeKb: 42,
      cachedAt: daysAgo(5, 16),
    },
    {
      id: "buf_005",
      voiceId: "voice_saras",
      text: "Namaste! Main aapki kaise madad kar sakti hoon?",
      durationSeconds: 3.2,
      sizeKb: 64,
      cachedAt: daysAgo(1, 11),
    },
    {
      id: "buf_006",
      voiceId: "voice_saras",
      text: "Kripya apna shikayat number note kar lein.",
      durationSeconds: 2.7,
      sizeKb: 52,
      cachedAt: daysAgo(4, 13),
    },
    {
      id: "buf_007",
      voiceId: "voice_saras",
      text: "Hum jald hi aapko update denge.",
      durationSeconds: 2.0,
      sizeKb: 38,
      cachedAt: daysAgo(6, 8),
    },
    {
      id: "buf_008",
      voiceId: "voice_aadhya",
      text: "Welcome to our multilingual voice assistant.",
      durationSeconds: 2.6,
      sizeKb: 50,
      cachedAt: daysAgo(2, 15),
    },
    {
      id: "buf_009",
      voiceId: "voice_aadhya",
      text: "Please describe your issue in a few words.",
      durationSeconds: 2.3,
      sizeKb: 44,
      cachedAt: daysAgo(7, 10),
    },
  ],
};

export function getBuffersForVoice(
  data: AudioBufferCacheData,
  voiceId: string
): AudioBufferCacheData["buffers"] {
  return data.buffers.filter((b) => b.voiceId === voiceId);
}
