import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getDashboardPath } from "../../utils/permissions";

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 text-white">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-green-300/10 blur-3xl" />

        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left content */}
          <div className="max-w-3xl">
            {/* Location badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-emerald-50 shadow-lg backdrop-blur-md">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
              <span>Welcome to Kakarcholi</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Discover
              <span className="block bg-gradient-to-r from-emerald-200 via-green-100 to-teal-200 bg-clip-text text-transparent">
                Kakarcholi
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-emerald-50/80 sm:text-lg lg:text-xl">
              Your digital gateway to Kakarcholi — explore village life,
              important places, local businesses, community events, notices,
              services and opportunities, all in one place.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link
                  to={getDashboardPath(user)}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-semibold text-emerald-800 shadow-xl transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-50"
                >
                  Go to Dashboard
                  <span className="ml-2">→</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-semibold text-emerald-800 shadow-xl transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-50"
                  >
                    Explore Kakarcholi
                    <span className="ml-2">→</span>
                  </Link>

                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-md transition duration-200 hover:bg-white/20"
                  >
                    Join Community
                  </Link>
                </>
              )}

              <Link
                to="/emergency"
                className="inline-flex items-center justify-center rounded-xl border border-red-300/30 bg-red-500/90 px-6 py-3.5 font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-red-500"
              >
                🚨 Emergency
              </Link>
            </div>

            {/* Small highlights */}
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-emerald-100/75">
              <span className="flex items-center gap-2">
                <span className="text-emerald-300">✓</span>
                Village Information
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-300">✓</span>
                Local Services
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-300">✓</span>
                Community Updates
              </span>
            </div>
          </div>

          {/* Right visual card */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto max-w-md">
              {/* Glow */}
              <div className="absolute -inset-5 rounded-[2rem] bg-emerald-300/20 blur-2xl" />

              {/* Main glass card */}
              <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-8">
                  {/* Village icon */}
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-300/30 to-teal-300/20 text-5xl shadow-inner">
                    🌾
                  </div>

                  <h2 className="mt-6 text-center text-3xl font-bold">
                    Kakarcholi
                  </h2>

                  <p className="mt-2 text-center text-sm leading-6 text-emerald-50/70">
                    Our village, our community, our digital home.
                  </p>

                  {/* Feature cards */}
                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <div className="text-2xl">🏡</div>
                      <p className="mt-2 text-sm font-semibold">Village</p>
                      <p className="mt-1 text-xs text-white/50">
                        Explore Kakarcholi
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <div className="text-2xl">👨‍👩‍👧‍👦</div>
                      <p className="mt-2 text-sm font-semibold">Community</p>
                      <p className="mt-1 text-xs text-white/50">
                        Stay connected
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <div className="text-2xl">📢</div>
                      <p className="mt-2 text-sm font-semibold">Updates</p>
                      <p className="mt-1 text-xs text-white/50">
                        Latest notices
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <div className="text-2xl">🛠️</div>
                      <p className="mt-2 text-sm font-semibold">Services</p>
                      <p className="mt-1 text-xs text-white/50">
                        Useful resources
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-5 -left-5 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20">
                    📍
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Digital Village</p>
                    <p className="font-semibold">Kakarcholi</p>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -right-5 -top-5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <span className="text-sm font-semibold">
                    One Village Hub
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent" />
    </section>
  );
}