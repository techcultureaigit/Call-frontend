"use client";

import { DUMMY_VOICE_RINGTONE } from "@/lib/constants/voices";

/** Prefer Cloudinary / provider preview; else local sample tone */
export function resolveVoicePreviewUrl(previewUrl?: string): string {
  const url = previewUrl?.trim();
  return url || DUMMY_VOICE_RINGTONE;
}

let sharedAudio: HTMLAudioElement | null = null;
let playingVoiceId: string | null = null;
let suppressPauseNotify = false;
const listeners = new Set<(id: string | null) => void>();

function getAudio() {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";
    sharedAudio.addEventListener("ended", () => {
      playingVoiceId = null;
      notify(null);
    });
    sharedAudio.addEventListener("pause", () => {
      if (suppressPauseNotify) return;
      if (playingVoiceId !== null) {
        playingVoiceId = null;
        notify(null);
      }
    });
    sharedAudio.addEventListener("error", () => {
      playingVoiceId = null;
      notify(null);
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

/** Mark a voice as playing (e.g. dialog `<audio>` controls). */
export function setPlayingVoiceId(voiceId: string | null) {
  if (playingVoiceId === voiceId) return;
  playingVoiceId = voiceId;
  notify(voiceId);
}

export async function playVoiceRingtone(
  voiceId: string,
  previewUrl?: string
) {
  const audio = getAudio();
  if (!audio) return;

  const primary = resolveVoicePreviewUrl(previewUrl);

  suppressPauseNotify = true;
  try {
    audio.pause();
    audio.src = primary;
    audio.load();
    audio.currentTime = 0;
    await audio.play();
    playingVoiceId = voiceId;
    notify(voiceId);
  } catch {
    // Preview URL failed — fall back to local sample
    if (primary !== DUMMY_VOICE_RINGTONE) {
      try {
        audio.src = DUMMY_VOICE_RINGTONE;
        audio.load();
        audio.currentTime = 0;
        await audio.play();
        playingVoiceId = voiceId;
        notify(voiceId);
        return;
      } catch {
        /* ignore */
      }
    }
    playingVoiceId = null;
    notify(null);
  } finally {
    suppressPauseNotify = false;
  }
}

export function stopVoiceRingtone() {
  const audio = getAudio();
  if (!audio) {
    playingVoiceId = null;
    notify(null);
    return;
  }
  suppressPauseNotify = true;
  try {
    audio.pause();
    audio.currentTime = 0;
  } finally {
    suppressPauseNotify = false;
  }
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
