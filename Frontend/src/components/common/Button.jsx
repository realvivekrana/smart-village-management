import Loader from "./Loader";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  onClick,
  ...props
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    outline: "btn-outline",
    ghost: "btn inline-flex text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
  };
  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader size="sm" /> : children}
    </button>
  );
}
