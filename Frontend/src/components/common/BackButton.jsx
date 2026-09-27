import { useNavigate } from "react-router-dom";

/**
 * Reusable back button.
 * - By default goes back one step in browser history.
 * - Pass `to="/some/path"` to force navigation to a fixed route instead
 *   (useful when the page can be opened directly, e.g. from a shared link).
 */
export default function BackButton({ to, label = "Back", className = "" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all ${className}`}
    >
      ← {label}
    </button>
  );
}