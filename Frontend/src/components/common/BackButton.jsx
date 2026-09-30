import { useLocation, useNavigate } from "react-router-dom";

/**
 * Reusable back button.
 * - Goes back one step in history when the user came from another page of the app.
 * - If there is nothing to go back to (page opened from a shared link, a fresh
 *   tab or after a refresh) it goes to `fallback` instead of doing nothing.
 * - `to="/some/path"` always navigates to that fixed route.
 * - `variant="onDark"` keeps it readable on gradient hero sections.
 */
const VARIANTS = {
  default:
    "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200",
  onDark:
    "border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20",
};

// react-router gives the very first entry of a session the key "default"
export function useGoBack(fallback = "/") {
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.key !== "default";
  return () => (canGoBack ? navigate(-1) : navigate(fallback, { replace: true }));
}

export default function BackButton({
  to,
  fallback = "/",
  label = "Back",
  className = "",
  variant = "default",
}) {
  const navigate = useNavigate();
  const goBack = useGoBack(fallback);

  const handleClick = () => {
    if (to) navigate(to);
    else goBack();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 min-h-[44px] sm:min-h-0 text-sm font-semibold shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all ${VARIANTS[variant] || VARIANTS.default} ${className}`}
    >
      ← {label}
    </button>
  );
}