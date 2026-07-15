"use client";

import { useEffect } from "react";

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean } = {}
) {
  const { metaKey = true, ctrlKey = true, shiftKey = false } = options;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isModifierPressed =
        (metaKey && event.metaKey) || (ctrlKey && event.ctrlKey);
      const isShiftMatch = shiftKey ? event.shiftKey : !event.shiftKey;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        isModifierPressed &&
        isShiftMatch
      ) {
        event.preventDefault();
        callback();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, metaKey, ctrlKey, shiftKey]);
}
