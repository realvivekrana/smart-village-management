import { Link } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { getDashboardPath } from "../../utils/permissions";
import { useVillage } from "../../context/VillageContext";

export default function Hero() {
  const { villageName, village } = useVillage();
  const { user } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | Dynamic Hero Background
  |--------------------------------------------------------------------------
  |
  | Priority:
  | 1. Village data se heroImage
  | 2. VITE_HERO_BACKGROUND environment variable
  | 3. Local default image
  |
  */

  const heroBackground =
    village?.heroImage ||
    import.meta.env.VITE_HERO_BACKGROUND ||
    "/village-hero-bg.webp";

  return (
    <section className="relative isolate min-h-[680px] overflow-hidden bg-emerald-950 text-white sm:min-h-[720px] lg:min-h-[760px]">

      {/* ================================================================ */}
      {/* BACKGROUND IMAGE                                                  */}
      {/* ================================================================ */}

      <div className="absolute inset-0 -z-30">
        <img
          src={heroBackground}
          alt={`${villageName} village`}
          className="h-full w-full object-cover object-center"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* ================================================================ */}
      {/* DARK OVERLAY                                                       */}
      {/* ================================================================ */}

      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

      <div className="absolute inset-0 -z-20 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

      {/* ================================================================ */}
      {/* GREEN CINEMATIC OVERLAY                                            */}
      {/* ================================================================ */}

      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-emerald-950/55 via-transparent to-emerald-900/30" />

      {/* ================================================================ */}
      {/* SOFT LIGHT EFFECTS                                                 */}
      {/* ================================================================ */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-green-400/10 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />

      </div>

      {/* ================================================================ */}
      {/* MAIN CONTENT                                                       */}
      {/* ================================================================ */}

      <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-4 py-16 sm:px-6 sm:py-20 lg:min-h-[760px] lg:px-8">

        <div className="grid grid-cols-1 w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">

          {/* ============================================================ */}
          {/* LEFT CONTENT                                                   */}
          {/* ============================================================ */}

          <div className="max-w-3xl">

            {/* Welcome Badge */}

            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-emerald-300/40 bg-emerald-950/50 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-xl">

              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.9)]" />

              <span>
                Welcome to {villageName}
              </span>

            </div>

            {/* Main Heading */}

            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl">

              <span className="block text-white drop-shadow-2xl">
                Our Village
              </span>

              <span className="block bg-gradient-to-r from-emerald-200 via-green-300 to-teal-200 bg-clip-text text-transparent drop-shadow-lg">
                {villageName}
              </span>

            </h1>

            {/* Description */}

            <p className="mt-7 max-w-2xl text-base font-medium leading-7 text-white/85 sm:text-lg sm:leading-8 lg:text-xl">

              A digital gateway to our village — explore village life,
              important places, local businesses, community events,
              notices, services and opportunities, all in one place.

            </p>

            {/* ========================================================== */}
            {/* CTA BUTTONS                                                 */}
            {/* ========================================================== */}

            <div className="mt-8 flex flex-wrap gap-3">

              {user ? (
                <Link
                  to={getDashboardPath(user)}
                  className="group inline-flex items-center justify-center rounded-xl bg-emerald-500 px-7 py-4 font-bold text-white shadow-xl shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400"
                >
                  Go to Dashboard

                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              ) : (
                <Link
                  to="/about"
                  className="group inline-flex items-center justify-center rounded-xl bg-emerald-500 px-7 py-4 font-bold text-white shadow-xl shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400"
                >
                  Explore {villageName}

                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              )}

              {!user && (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-black/20 px-7 py-4 font-bold text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
                >
                  Join Community
                </Link>
              )}

              <Link
                to="/emergency"
                className="inline-flex items-center justify-center rounded-xl border border-red-300/40 bg-red-600/90 px-7 py-4 font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-red-500"
              >
                🚨 Emergency Help
              </Link>

            </div>

            {/* ========================================================== */}
            {/* FEATURE POINTS                                               */}
            {/* ========================================================== */}

            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-white/85">

              <span className="flex items-center gap-2">

                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                  ✓
                </span>

                Village Information

              </span>

              <span className="flex items-center gap-2">

                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                  ✓
                </span>

                Local Services

              </span>

              <span className="flex items-center gap-2">

                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                  ✓
                </span>

                Community Updates

              </span>

            </div>

          </div>

          {/* ============================================================ */}
          {/* RIGHT GLASS CARD                                               */}
          {/* ============================================================ */}

          <div className="relative hidden lg:block">

            {/* Glow */}

            <div className="absolute -inset-8 rounded-[3rem] bg-emerald-400/20 blur-3xl" />

            {/* Floating Badge */}

            <div className="absolute -right-8 -top-8 z-20 rounded-3xl border border-emerald-300/40 bg-emerald-600/90 px-7 py-4 shadow-2xl backdrop-blur-xl">

              <div className="flex items-center gap-3">

                <span className="text-2xl">
                  ✨
                </span>

                <span className="text-lg font-bold">
                  One Village Hub
                </span>

              </div>

            </div>

            {/* Main Glass Card */}

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/25 bg-emerald-950/45 p-5 shadow-2xl backdrop-blur-xl">

              <div className="rounded-[2rem] border border-white/15 bg-black/20 p-7">

                {/* Village Icon */}

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-emerald-300/30 bg-emerald-500/20 text-5xl shadow-xl">
                  🏡
                </div>

                {/* Village Name */}

                <h2 className="mt-5 text-center text-3xl font-black text-white">
                  {villageName}
                </h2>

                <p className="mt-2 text-center text-sm leading-6 text-white/70">
                  Our village, our community, our digital home.
                </p>

                {/* ====================================================== */}
                {/* FEATURE GRID                                             */}
                {/* ====================================================== */}

                <div className="mt-7 grid grid-cols-2 gap-3">

                  {/* Village */}

                  <Link
                    to="/about"
                    className="group rounded-2xl border border-white/15 bg-white/10 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-3xl">
                        🏡
                      </span>

                      <span className="text-xl text-white/60 transition-transform group-hover:translate-x-1">
                        ›
                      </span>

                    </div>

                    <p className="mt-3 font-bold">
                      Village
                    </p>

                    <p className="mt-1 text-xs text-white/55">
                      Explore {villageName}
                    </p>

                  </Link>

                  {/* Community */}

                  <Link
                    to="/community"
                    className="group rounded-2xl border border-white/15 bg-white/10 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-3xl">
                        👨‍👩‍👧‍👦
                      </span>

                      <span className="text-xl text-white/60 transition-transform group-hover:translate-x-1">
                        ›
                      </span>

                    </div>

                    <p className="mt-3 font-bold">
                      Community
                    </p>

                    <p className="mt-1 text-xs text-white/55">
                      Stay connected
                    </p>

                  </Link>

                  {/* Notices */}

                  <Link
                    to="/notices"
                    className="group rounded-2xl border border-white/15 bg-white/10 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-3xl">
                        📢
                      </span>

                      <span className="text-xl text-white/60 transition-transform group-hover:translate-x-1">
                        ›
                      </span>

                    </div>

                    <p className="mt-3 font-bold">
                      Notices & Updates
                    </p>

                    <p className="mt-1 text-xs text-white/55">
                      Latest information
                    </p>

                  </Link>

                  {/* Services */}

                  <Link
                    to="/services"
                    className="group rounded-2xl border border-white/15 bg-white/10 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-3xl">
                        🛠️
                      </span>

                      <span className="text-xl text-white/60 transition-transform group-hover:translate-x-1">
                        ›
                      </span>

                    </div>

                    <p className="mt-3 font-bold">
                      Services
                    </p>

                    <p className="mt-1 text-xs text-white/55">
                      Useful resources
                    </p>

                  </Link>

                </div>

              </div>

            </div>

            {/* ========================================================== */}
            {/* LOCATION BADGE                                              */}
            {/* ========================================================== */}

            <div className="absolute -bottom-6 -left-7 z-20 rounded-2xl border border-white/20 bg-black/35 px-5 py-4 shadow-2xl backdrop-blur-xl">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/25 text-xl">
                  📍
                </div>

                <div>

                  <p className="text-xs text-white/55">
                    Digital Village
                  </p>

                  <p className="font-bold text-white">
                    {villageName}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================================================================ */}
      {/* BOTTOM FADE                                                       */}
      {/* ================================================================ */}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

    </section>
  );
}