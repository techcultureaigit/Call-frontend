"use client";

import { DUMMY_VOICE_RINGTONE } from "@/lib/constants/voices";

let sharedAudio: HTMLAudioElement | null = null;
let playingVoiceId: string | null = null;
const listeners = new Set<(id: string | null) => void>();

function getAudio() {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio(DUMMY_VOICE_RINGTONE);
    sharedAudio.preload = "auto";
    sharedAudio.addEventListener("ended", () => {
      playingVoiceId = null;
      listeners.forEach((l) => l(null));
    });
    sharedAudio.addEventListener("pause", () => {
      if (sharedAudio?.ended) return;
      // keep playingVoiceId until explicitly stopped / ended unless paused mid-play by stop
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

export async function playVoiceRingtone(voiceId: string) {
  const audio = getAudio();
  if (!audio) return;

  try {
    audio.pause();
    audio.currentTime = 0;
    playingVoiceId = voiceId;
    notify(voiceId);
    await audio.play();
  } catch {
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

export function toggleVoiceRingtone(voiceId: string) {
  if (playingVoiceId === voiceId) {
    stopVoiceRingtone();
    return;
  }
  void playVoiceRingtone(voiceId);
}
