import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

/*
| Notification se aaye `?highlight=<id>` ko handle karta hai.
|
| - `ready` true hote hi (data load ho chuka ho) matching element tak scroll karta hai
| - kuch second ke liye ring lagata hai, phir hata deta hai
|
| Element par `data-highlight-id={item._id}` lagana zaroori hai, aur
| className me `hlClass(item._id)` jodna hai.
*/

const HIGHLIGHT_MS = 4000;

export default function useHighlight(ready = true) {
  const [params] = useSearchParams();
  const targetId = params.get("highlight");
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!targetId || !ready) return undefined;

    setActiveId(targetId);

    const el = Array.from(document.querySelectorAll("[data-highlight-id]")).find(
      (node) => node.getAttribute("data-highlight-id") === targetId
    );
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });

    const timer = setTimeout(() => setActiveId(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [targetId, ready]);

  const hlClass = useCallback(
    (id) =>
      activeId && id === activeId
        ? "rounded-xl ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900 transition-shadow"
        : "",
    [activeId]
  );

  return { targetId, highlightId: activeId, hlClass };
}