"use client";

import { DUMMY_VOICE_RINGTONE } from "@/lib/constants/voices";

/** Prefer Cloudinary / provider preview; else local sample tone */
export function resolveVoicePreviewUrl(previewUrl?: string): string {
  const url = previewUrl?.trim();
  return url || DUMMY_VOICE_RINGTONE;
}

let sharedAudio: HTMLAudioElement | null = null;
let playingVoiceId: string | null = null;
const listeners = new Set<(id: string | null) => void>();

function getAudio() {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";
    sharedAudio.addEventListener("ended", () => {
      playingVoiceId = null;
      listeners.forEach((l) => l(null));
    });
    sharedAudio.addEventListener("error", () => {
      playingVoiceId = null;
      listeners.forEach((l) => l(null));
    });
  }
  return sharedAudio;
}

function notify(id: string | null) {
  listeners.forEach((l) => l(id));
}

export function subscribeVoicePlayback(listener: (id: string | null) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPlayingVoiceId() {
  return playingVoiceId;
}

export async function playVoiceRingtone(
  voiceId: string,
  previewUrl?: string
) {
  const audio = getAudio();
  if (!audio) return;

  const primary = resolveVoicePreviewUrl(previewUrl);

  try {
    audio.pause();
    audio.src = primary;
    audio.load();
    audio.currentTime = 0;
    playingVoiceId = voiceId;
    notify(voiceId);
    await audio.play();
  } catch {
    // Preview URL failed — fall back to local sample
    if (primary !== DUMMY_VOICE_RINGTONE) {
      try {
        audio.src = DUMMY_VOICE_RINGTONE;
        audio.load();
        audio.currentTime = 0;
        playingVoiceId = voiceId;
        notify(voiceId);
        await audio.play();
        return;
      } catch {
        /* ignore */
      }
    }
    playingVoiceId = null;
    notify(null);
  }
}

export function stopVoiceRingtone() {
  const audio = getAudio();
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  playingVoiceId = null;
  notify(null);
}

export function toggleVoiceRingtone(voiceId: string, previewUrl?: string) {
  if (playingVoiceId === voiceId) {
    stopVoiceRingtone();
    return;
  }
  void playVoiceRingtone(voiceId, previewUrl);
}
