import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fullImageUrl, toImageItem, toImageItems } from "../../utils/image";

/*
| Photo zoom viewer (poori app me ek hi)
|
|   const { open } = useLightbox();
|   open(images, startIndex)        // images: [{url, alt}] ya ["url"]
|
|   <ZoomImage src={url} alt="..." className="..." />            // ek photo
|   <ZoomImage src={url} group={post.images} index={i} />       // gallery (next / prev)
|
| Features: Esc se band, ← → keys, swipe, tap-to-zoom, backdrop click se band.
*/

const LightboxContext = createContext({ open: () => {}, close: () => {} });

export const useLightbox = () => useContext(LightboxContext);

export function LightboxProvider({ children }) {
  const [state, setState] = useState({ images: [], index: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((images, index = 0) => {
    const items = toImageItems(images);
    if (!items.length) return;
    setState({ images: items, index: Math.min(Math.max(index, 0), items.length - 1) });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <LightboxContext.Provider value={value}>
      {children}
      {isOpen && (
        <Viewer
          images={state.images}
          startIndex={state.index}
          onClose={close}
        />
      )}
    </LightboxContext.Provider>
  );
}

function Viewer({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const closeRef = useRef(null);
  const touchX = useRef(null);

  const total = images.length;
  const current = images[index];

  const go = useCallback(
    (dir) => {
      if (total < 2) return;
      setZoomed(false);
      setLoaded(false);
      setIndex((i) => (i + dir + total) % total);
    },
    [total]
  );

  // Keyboard + scroll lock + focus restore
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [go, onClose]);

  // Aas-paas ki photos pehle se load (swipe tez lage)
  useEffect(() => {
    if (total < 2) return;
    [index + 1, index - 1].forEach((i) => {
      const item = images[(i + total) % total];
      if (item) new Image().src = fullImageUrl(item.url);
    });
  }, [index, images, total]);

  const onTouchStart = (e) => {
    touchX.current = zoomed ? null : e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  if (!current) return null;

  const navBtn =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white backdrop-blur hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.alt || "Photo"}
      className="fixed inset-0 z-[100] flex flex-col bg-black/90"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm text-white/80">
          {total > 1 ? `${index + 1} / ${total}` : ""}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center rounded-full bg-white/15 px-4 text-sm hover:bg-white/30"
          >
            Open original
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        className={`relative flex-1 min-h-0 ${zoomed ? "overflow-auto" : "overflow-hidden"}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {total > 1 && (
          <button
            type="button"
            aria-label="Previous photo"
            className={`${navBtn} left-3`}
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
          >
            ‹
          </button>
        )}

        <div
          className={`flex min-h-full items-center justify-center p-2 sm:p-6 ${
            zoomed ? "w-max min-w-full" : "h-full"
          }`}
        >
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            </div>
          )}
          <img
            key={current.url}
            src={fullImageUrl(current.url)}
            alt={current.alt || ""}
            onLoad={() => setLoaded(true)}
            onError={(e) => {
              // Optimized URL fail ho to original try karo
              if (e.currentTarget.src !== current.url) e.currentTarget.src = current.url;
              else setLoaded(true);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setZoomed((z) => !z);
            }}
            draggable={false}
            className={`select-none rounded-lg shadow-2xl transition-opacity duration-200 ${
              loaded ? "opacity-100" : "opacity-0"
            } ${
              zoomed
                ? "max-w-none w-[220%] sm:w-[160%] cursor-zoom-out"
                : "max-h-full max-w-full object-contain cursor-zoom-in"
            }`}
          />
        </div>

        {total > 1 && (
          <button
            type="button"
            aria-label="Next photo"
            className={`${navBtn} right-3`}
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
          >
            ›
          </button>
        )}
      </div>

      {/* Caption */}
      {(current.caption || current.alt) && (
        <div
          className="px-4 py-3 text-center text-sm text-white/90"
          onClick={(e) => e.stopPropagation()}
        >
          {current.caption || current.alt}
        </div>
      )}
    </div>
  );
}

/*
| Click karne par bada hone wali <img>.
| group  : poori gallery (next/prev ke liye), index : is photo ka number.
| thumb  : Cloudinary thumbnail width (optional).
*/
export function ZoomImage({
  src,
  alt = "",
  group,
  index = 0,
  className = "",
  onClick,
  ...rest
}) {
  const { open } = useLightbox();

  if (!src) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClick?.(e);
    const items = group && group.length ? group : [toImageItem(src, alt)];
    open(items, group && group.length ? index : 0);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") handleClick(e);
  };

  return (
    <img
      src={src}
      alt={alt}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKey}
      className={`cursor-zoom-in ${className}`}
      {...rest}
    />
  );
}