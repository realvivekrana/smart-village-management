import { useEffect, useState } from "react";

const backgroundImages = {
  home: "/backgrounds/home.jpg",

  about: "/backgrounds/about-village.jpg",

  services: "/backgrounds/services.jpg",

  notices: "/backgrounds/notices.jpg",

  events: "/backgrounds/events.jpg",

  emergency: "/backgrounds/emergency.jpg",

  gallery: "/backgrounds/gallery.jpg",

  businesses: "/backgrounds/businesses.jpg",

  community: "/backgrounds/community.jpg",

  jobs: "/backgrounds/jobs.jpg",

  bazaar: "/backgrounds/bazaar.jpg",

  places: "/backgrounds/places.jpg",

  contact: "/backgrounds/contact.jpg",

  auth: "/backgrounds/auth.jpg",

  citizenDashboard: "/backgrounds/citizen-dashboard.jpg",

  adminDashboard: "/backgrounds/admin-dashboard.jpg",
};

/*
|--------------------------------------------------------------------------
| Page Background
|--------------------------------------------------------------------------
|
| Reusable full-page background component.
|
| Usage:
|
| <PageBackground type="services">
|   <YourPageContent />
| </PageBackground>
|
|--------------------------------------------------------------------------
*/

export default function PageBackground({
  type = "home",
  children,
  className = "",
  overlay = "dark",
  fixed = false,
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const backgroundImage =
    backgroundImages[type] ||
    backgroundImages.home;

  /*
  |--------------------------------------------------------------------------
  | Preload background image
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const image = new Image();

    image.src = backgroundImage;

    image.onload = () => {
      setImageLoaded(true);
    };

    image.onerror = () => {
      setImageLoaded(false);
    };

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [backgroundImage]);

  /*
  |--------------------------------------------------------------------------
  | Overlay Styles
  |--------------------------------------------------------------------------
  */

  const overlayClasses = {
    dark: "bg-black/60",

    darker: "bg-black/70",

    light: "bg-black/40",

    green: "bg-emerald-950/65",

    greenLight: "bg-emerald-950/45",

    gradient:
      "bg-gradient-to-b from-black/50 via-black/60 to-black/80",

    cinematic:
      "bg-gradient-to-r from-black/80 via-black/55 to-black/35",
  };

  const selectedOverlay =
    overlayClasses[overlay] ||
    overlayClasses.dark;

  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-slate-950 ${className}`}
    >

      {/* ================================================================ */}
      {/* BACKGROUND                                                        */}
      {/* ================================================================ */}

      <div
        className={`absolute inset-0 ${
          fixed ? "fixed" : ""
        }`}
        aria-hidden="true"
      >

        {/* Background Image */}

        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
            imageLoaded
              ? "opacity-100"
              : "opacity-0"
          }`}
          style={{
            backgroundImage: `url("${backgroundImage}")`,
          }}
        />

        {/* ============================================================ */}
        {/* BACKGROUND OVERLAY                                             */}
        {/* ============================================================ */}

        <div
          className={`absolute inset-0 ${selectedOverlay}`}
        />

        {/* ============================================================ */}
        {/* GREEN TINT                                                     */}
        {/* ============================================================ */}

        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/25 via-transparent to-green-950/20" />

        {/* ============================================================ */}
        {/* BOTTOM DARK GRADIENT                                           */}
        {/* ============================================================ */}

        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

      </div>

      {/* ================================================================ */}
      {/* CONTENT                                                           */}
      {/* ================================================================ */}

      <div className="relative z-10 min-h-screen">
        {children}
      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Background List Export
|--------------------------------------------------------------------------
|
| Useful if another component needs to display or preload backgrounds.
|--------------------------------------------------------------------------
*/

export { backgroundImages };