import { useEffect, useRef, useCallback } from "react";
import { router } from "expo-router";
import { logout } from "@/lib/data";

/**
 * PRD FR-4.3 — on shared tablets the session must auto-return to the welcome
 * screen after 5 minutes of inactivity, so one child's progress is never
 * recorded against another. Any touch resets the timer.
 */
const IDLE_MS = 5 * 60 * 1000;

export function useIdleTimeout(enabled = true) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (!enabled) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await logout();
      router.replace("/(auth)/login");
    }, IDLE_MS);
  }, [enabled]);

  useEffect(() => {
    reset();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [reset]);

  return reset;
}
