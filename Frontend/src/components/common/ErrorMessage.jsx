export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
      <div className="flex items-start gap-3">
        <span className="text-red-500 text-lg">⚠️</span>
        <div>
          <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-600 hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
