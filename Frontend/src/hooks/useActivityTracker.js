import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { sendTrack, trackPageView } from "../utils/activityTracker";

const HEARTBEAT_MS = 60 * 1000;

/*
| App.jsx me ek baar lagao: har page change par page view, aur tab khula ho
| tab tak har 60 sec me heartbeat ("abhi online hai" + kitna time active raha).
*/
export default function useActivityTracker() {
  const { pathname } = useLocation();
  const lastPath = useRef(null);
  const pathRef = useRef(pathname);
  const lastBeat = useRef(Date.now());

  pathRef.current = pathname;

  // Page view
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

  // Heartbeat + tab visibility
  useEffect(() => {
    const beat = () => {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();
      const seconds = Math.round((now - lastBeat.current) / 1000);
      lastBeat.current = now;

      sendTrack({ type: "heartbeat", path: pathRef.current, activeSeconds: Math.min(seconds, 70) });
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        lastBeat.current = Date.now();
        sendTrack({ type: "heartbeat", path: pathRef.current, activeSeconds: 0 });
      } else {
        sendTrack({ type: "end", path: pathRef.current });
      }
    };

    const onPageHide = () => sendTrack({ type: "end", path: pathRef.current });

    const timer = setInterval(beat, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);
}