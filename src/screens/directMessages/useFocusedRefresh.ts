import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { AppState, Platform } from "react-native";

export function useFocusedRefresh(
  refresh: (visible: () => boolean) => Promise<void>,
  enabled = true,
  delay = 5000,
) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      let mounted = true;
      let pending = false;
      const visible = () =>
        mounted &&
        (Platform.OS === "web"
          ? typeof document !== "undefined" && !document.hidden
          : AppState.currentState !== "background" &&
            AppState.currentState !== "inactive");
      async function tick() {
        if (pending || !visible()) return;
        pending = true;
        try {
          await refresh(visible);
        } finally {
          pending = false;
        }
      }
      void tick();
      const timer = setInterval(() => void tick(), delay);
      const sub = AppState.addEventListener("change", () => void tick());
      if (Platform.OS === "web" && typeof document !== "undefined")
        document.addEventListener("visibilitychange", tick);
      return () => {
        mounted = false;
        clearInterval(timer);
        sub.remove();
        if (Platform.OS === "web" && typeof document !== "undefined")
          document.removeEventListener("visibilitychange", tick);
      };
    }, [refresh, enabled, delay]),
  );
}
