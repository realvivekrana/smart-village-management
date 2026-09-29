import { useNavigate } from "react-router-dom";

/**
 * Reusable back button.
 * - By default goes back one step in browser history.
 * - Pass `to="/some/path"` to force navigation to a fixed route instead
 *   (useful when the page can be opened directly, e.g. from a shared link).
 * - Pass `variant="onDark"` when placing it on a coloured / gradient hero
 *   section so it stays readable in both light and dark themes.
 */
const VARIANTS = {
  default:
    "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200",
  onDark:
    "border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20",
};

export default function BackButton({
  to,
  label = "Back",
  className = "",
  variant = "default",
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all ${VARIANTS[variant] || VARIANTS.default} ${className}`}
    >
      ← {label}
    </button>
  );
}