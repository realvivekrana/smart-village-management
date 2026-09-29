import { useState } from "react";

export default function OptimizedImage({
  src,
  alt = "",
  className = "",
  fallback = "/logo.png",
  loading = "lazy",
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(src || fallback);

  const handleError = () => {
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={handleError}
      {...props}
    />
  );
}