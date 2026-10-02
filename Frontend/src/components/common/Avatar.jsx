import { useEffect, useState } from "react";
import { avatarUrl } from "../../utils/image";
import { useLightbox } from "./ImageLightbox";

/*
| User ki photo; photo na ho (ya load na ho) to naam ka pehla akshar.
|
|   <Avatar user={user} size="md" />
|   <Avatar user={post.createdBy} size="sm" zoom />   // click par photo bada
|   <Avatar src={url} name="Ram" size="xl" zoom />
|
| size: xs(24) sm(32) md(40) lg(64) xl(128)  ya  number (px)
*/

const SIZES = {
  xs: { px: 24, text: "text-[10px]" },
  sm: { px: 32, text: "text-sm" },
  md: { px: 40, text: "text-base" },
  lg: { px: 64, text: "text-2xl" },
  xl: { px: 128, text: "text-5xl" },
};

export default function Avatar({
  user,
  src,
  name,
  size = "md",
  zoom = false,
  className = "",
}) {
  const url = src ?? user?.avatar ?? "";
  const label = name ?? user?.name ?? "";

  const [failed, setFailed] = useState(false);
  const { open } = useLightbox();

  // Nayi photo aaye to error flag reset
  useEffect(() => setFailed(false), [url]);

  const preset = typeof size === "number" ? { px: size, text: "text-base" } : SIZES[size] || SIZES.md;
  const showImage = Boolean(url) && !failed;
  const initial = label.trim().charAt(0).toUpperCase() || "?";

  const box = {
    width: preset.px,
    height: preset.px,
    minWidth: preset.px,
  };

  const body = showImage ? (
    <img
      src={avatarUrl(url, preset.px)}
      alt={label}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  ) : (
    <span className={`font-semibold text-white ${preset.text}`} aria-hidden="true">
      {initial}
    </span>
  );

  const base = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-600 ${className}`;

  if (zoom && showImage) {
    return (
      <button
        type="button"
        style={box}
        aria-label={`${label} photo`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          open([{ url, alt: label }]);
        }}
        className={`${base} cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`}
      >
        {body}
      </button>
    );
  }

  return (
    <span style={box} className={base}>
      {body}
    </span>
  );
}