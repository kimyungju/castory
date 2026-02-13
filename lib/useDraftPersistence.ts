import { useEffect, useState, useRef, useCallback } from "react";
import { useDebounce } from "./useDebounce";

/**
 * Read a draft from localStorage. Call once on mount.
 */
export function readDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Auto-save state to localStorage with debounce.
 * Returns `lastSaved` timestamp and `clearDraft` to remove persisted data.
 *
 * Uses a 750ms ready delay so the initial restore doesn't immediately
 * overwrite localStorage with stale/default values.
 */
export function useDraftSave<T>(key: string, state: T) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [ready, setReady] = useState(false);
  const debouncedState = useDebounce(state, 500);

  // Wait 750ms after mount before enabling saves
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 750);
    return () => clearTimeout(timer);
  }, []);

  // Persist debounced state once ready
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(debouncedState));
      setLastSaved(new Date());
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, [key, debouncedState, ready]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setLastSaved(null);
  }, [key]);

  return { lastSaved, clearDraft };
}
