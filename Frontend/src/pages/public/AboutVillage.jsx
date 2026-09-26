import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const PLACE_TYPE_ICONS = {
  temple: "🛕",
  mosque: "🕌",
  church: "⛪",
  school: "🏫",
  college: "🎓",
  hospital: "🏥",
  health_center: "⚕️",
  park: "🌳",
  market: "🛒",
  super_market: "🛍️",
  government_office: "🏛️",
  police_station: "👮",
  railway_station: "🚆",
  bus_stop: "🚌",
  atm: "🏧",
  petrol_pump: "⛽",
  restaurant: "🍽️",
  hotel: "🏨",
  cinema: "🎬",
  electronic_shop: "🔌",
  water_body: "💧",
  tourist_place: "📸",
  other: "📍",
};

export default function AboutVillage() {
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadVillage = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/village");

        const data =
          response?.data?.data ||
          response?.data?.village ||
          response?.data;

        if (!data?._id) {
          throw new Error("Village information not found");
        }

        if (mounted) {
          setVillage(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load village information"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadVillage();

    return () => {
      mounted = false;
    };
  }, []);

  const data = useMemo(() => {
    if (!village) return null;

    const places = Array.isArray(village.places)
      ? village.places.filter((item) => item?.isActive !== false)
      : [];

    const images = Array.isArray(village.images)
      ? village.images
          .map((image) => {
            if (typeof image === "string") {
              return {
                url: image,
                caption: village.name,
              };
            }

            return {
              url: image?.url,
              caption: image?.caption || village.name,
            };
          })
          .filter((image) => image.url)
      : [];

    const languages = Array.isArray(village.languages)
      ? village.languages
      : [];

    const rivers = Array.isArray(village.rivers)
      ? village.rivers
      : [];

    const howToReach = village.howToReach || {};
    const sarpanch = village.sarpanch || {};

    const nearbyGroups = [
      {
        title: "Nearby Villages",
        icon: "🏘️",
        items: village.nearbyVillages,
      },
      {
        title: "Nearby Cities",
        icon: "🏙️",
        items: village.nearbyCities,
      },
      {
        title: "Nearby Blocks / Taluks",
        icon: "🧭",
        items: village.nearbyTaluks,
      },
      {
        title: "Nearby Districts",
        icon: "🗺️",
        items: village.nearbyDistricts,
      },
      {
        title: "Railway Stations",
        icon: "🚆",
        items: village.nearbyRailwayStations,
      },
      {
        title: "Airports",
        icon: "✈️",
        items: village.nearbyAirports,
      },
      {
        title: "Tourist Places",
        icon: "📸",
        items: village.nearbyTouristPlaces,
      },
    ].filter(
      (group) => Array.isArray(group.items) && group.items.length > 0
    );

    return {
      places,
      images,
      languages,
      rivers,
      howToReach,
      sarpanch,
      nearbyGroups,
    };
  }, [village]);

  if (loading) {
    return <AboutSkeleton />;
  }

  if (error || !village || !data) {
    return (
      <main className="min-h-[70vh] bg-slate-50 px-4 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl dark:border-red-900/40 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl dark:bg-red-900/20">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
            Village Information Unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {error || "No village information is available right now."}
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const mapAvailable =
    village.location?.lat !== undefined &&
    village.location?.lng !== undefined;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-700" />

        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.08]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-20 sm:px-6 lg:px-8 lg:pb-36 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_.8fr]">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Village Profile
              </div>

              <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                {village.name}
              </h1>

              {village.localName && (
                <p className="mt-3 text-xl font-medium text-cyan-100">
                  {village.localName}
                </p>
              )}

              <p className="mt-7 max-w-2xl text-base leading-8 text-blue-50 sm:text-lg">
                {village.description ||
                  `Explore ${village.name}, its people, culture, important places, connectivity and local information.`}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {village.district && (
                  <HeroBadge icon="📍" text={village.district} />
                )}

                {village.state && (
                  <HeroBadge icon="🗺️" text={village.state} />
                )}

                {village.pincode && (
                  <HeroBadge icon="📮" text={village.pincode} />
                )}
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/village-places"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Explore Places →
                </Link>

                {mapAvailable && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${village.location.lat},${village.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
                  >
                    📍 View on Map
                  </a>
                )}
              </div>
            </div>

            <HeroVisual
              village={village}
              image={data.images[0]}
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          STATS
      ========================================================= */}
      <section className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="👥"
            label="Population"
            value={
              village.population
                ? Number(village.population).toLocaleString()
                : "—"
            }
          />

          <StatCard
            icon="📐"
            label="Area"
            value={village.area ? `${village.area} km²` : "—"}
          />

          <StatCard
            icon="📍"
            label="Important Places"
            value={data.places.length}
          />

          <StatCard
            icon="🗣️"
            label="Languages"
            value={data.languages.length || "—"}
          />
        </div>
      </section>

      {/* =========================================================
          ABOUT + DETAILS
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr]">

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-9">
            <SectionHeading
              eyebrow="Know Your Village"
              title={`About ${village.name}`}
              description="A closer look at the village, its history and identity."
            />

            <div className="mt-8 space-y-6 text-[15px] leading-8 text-slate-600 dark:text-slate-300">
              <p>
                {village.description ||
                  `Welcome to ${village.name}. This section contains information about the village and its community.`}
              </p>

              {village.history && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 dark:border-blue-900/30 dark:bg-blue-950/20">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                      📜
                    </span>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Our History
                    </h3>
                  </div>

                  <p className="mt-4 whitespace-pre-line">
                    {village.history}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <SectionHeading
              eyebrow="Quick Information"
              title="Village Details"
            />

            <div className="mt-7 divide-y divide-slate-100 dark:divide-slate-800">
              <DetailRow label="Village" value={village.name} />
              <DetailRow label="Block" value={village.block} />
              <DetailRow label="District" value={village.district} />
              <DetailRow label="State" value={village.state} />
              <DetailRow label="PIN Code" value={village.pincode} />
              <DetailRow label="STD Code" value={village.stdCode} />

              <DetailRow
                label="Altitude"
                value={
                  village.altitude
                    ? `${village.altitude} m`
                    : null
                }
              />

              <DetailRow
                label="Assembly"
                value={village.assemblyConstituency}
              />

              <DetailRow
                label="Lok Sabha"
                value={village.lokSabhaConstituency}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LANGUAGES
      ========================================================= */}
      {data.languages.length > 0 && (
        <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Culture & Community"
              title="Languages Spoken"
              description={`Languages commonly associated with ${village.name}.`}
            />

            <div className="mt-8 flex flex-wrap gap-3">
              {data.languages.map((language) => (
                <span
                  key={language}
                  className="rounded-full border border-blue-100 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300"
                >
                  🗣️ {language}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          CONNECTIVITY
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Connectivity"
          title={`How to Reach ${village.name}`}
          description="Useful information for travelling to and from the village."
        />

        <div className="mt-9 grid gap-5 md:grid-cols-3">
          <ReachCard
            icon="🚗"
            title="By Road"
            value={
              data.howToReach.road ||
              "Road connectivity information will be updated soon."
            }
          />

          <ReachCard
            icon="🚆"
            title="By Rail"
            value={
              data.howToReach.rail ||
              "Railway connectivity information will be updated soon."
            }
          />

          <ReachCard
            icon="✈️"
            title="By Air"
            value={
              data.howToReach.air ||
              "Airport connectivity information will be updated soon."
            }
          />
        </div>
      </section>

      {/* =========================================================
          MAP
      ========================================================= */}
      {mapAvailable && (
        <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Find Us"
                title="Village Location"
                description="Locate the village and explore the surrounding area."
              />

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${village.location.lat},${village.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Open Google Maps ↗
              </a>
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 shadow-xl dark:border-slate-700">
              <iframe
                title={`${village.name} location map`}
                src={`https://www.google.com/maps?q=${village.location.lat},${village.location.lng}&hl=en&z=13&output=embed`}
                className="h-[420px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          IMPORTANT PLACES
      ========================================================= */}
      {data.places.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Explore"
              title="Important Places"
              description="Discover important facilities and places around the village."
            />

            <Link
              to="/village-places"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all places →
            </Link>
          </div>

          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.places.slice(0, 6).map((place) => (
              <PlaceCard key={place._id || place.name} place={place} />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================
          RIVERS / WATER BODIES
      ========================================================= */}
      {data.rivers.length > 0 && (
        <section className="bg-cyan-50 dark:bg-cyan-950/20">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Nature"
              title="Rivers & Water Bodies"
              description="Natural water resources associated with the village."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.rivers.map((river) => (
                <div
                  key={river}
                  className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-cyan-900/40 dark:bg-slate-900"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl dark:bg-cyan-900/30">
                    💧
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                    {river}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          VILLAGE REPRESENTATIVE
      ========================================================= */}
      {(data.sarpanch.name || data.sarpanch.phone) && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Administration"
            title="Village Representative"
            description="Local representative information."
          />

          <div className="mt-8 max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />

            <div className="p-7">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl dark:bg-blue-900/30">
                  👤
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Village Representative
                  </p>

                  {data.sarpanch.name && (
                    <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                      {data.sarpanch.name}
                    </h3>
                  )}
                </div>
              </div>

              {data.sarpanch.phone && (
                <a
                  href={`tel:${data.sarpanch.phone}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300"
                >
                  📞 {data.sarpanch.phone}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          NEARBY
      ========================================================= */}
      {data.nearbyGroups.length > 0 && (
        <section className="border-y border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Around the Village"
              title="Nearby Places & Connectivity"
              description="Useful nearby locations and transportation points."
            />

            <div className="mt-9 grid gap-6 md:grid-cols-2">
              {data.nearbyGroups.map((group) => (
                <div
                  key={group.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-950/30">
                      {group.icon}
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {group.title}
                    </h3>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {group.items.map((item, index) => {
                      const name =
                        typeof item === "string"
                          ? item
                          : item?.name || item?.title;

                      const distance =
                        typeof item === "object"
                          ? item?.distanceKm
                          : null;

                      if (!name) return null;

                      return (
                        <span
                          key={`${name}-${index}`}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {name}
                          {distance !== undefined &&
                            distance !== null && (
                              <span className="ml-2 text-xs text-slate-400">
                                {distance} km
                              </span>
                            )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          GALLERY
      ========================================================= */}
      {data.images.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Village Gallery"
            title={`${village.name} in Pictures`}
            description="A visual glimpse of the village and its surroundings."
          />

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.images.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                onClick={() => setActiveImage(image)}
                className="group relative overflow-hidden rounded-3xl bg-slate-200 text-left shadow-sm"
              >
                <img
                  src={image.url}
                  alt={image.caption || village.name}
                  className="h-64 w-full object-cover transition duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

                <div className="absolute bottom-0 left-0 right-0 translate-y-3 p-5 text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-sm font-semibold">
                    {image.caption || village.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl backdrop-blur-md">
            🏡
          </div>

          <h2 className="mt-6 text-3xl font-black text-white sm:text-4xl">
            Discover {village.name}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Explore local services, important places, events, businesses,
            notices and community information through the village platform.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
            >
              ← Back to Home
            </Link>

            <Link
              to="/village-places"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            >
              Explore Places →
            </Link>
          </div>
        </div>
      </section>

      {/* IMAGE MODAL */}
      {activeImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-3xl bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-xl text-white backdrop-blur-md hover:bg-black/80"
            >
              ✕
            </button>

            <img
              src={activeImage.url}
              alt={activeImage.caption || village.name}
              className="max-h-[82vh] w-auto max-w-full object-contain"
            />

            {activeImage.caption && (
              <div className="bg-black px-5 py-4 text-sm text-white">
                {activeImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function HeroBadge({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
      <span>{icon}</span>
      {text}
    </span>
  );
}

function HeroVisual({ village, image }) {
  if (image?.url) {
    return (
      <div className="relative mx-auto w-full max-w-xl">
        <div className="absolute -inset-4 rounded-[2rem] bg-cyan-400/20 blur-2xl" />

        <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-md">
          <img
            src={image.url}
            alt={image.caption || village.name}
            className="h-[360px] w-full rounded-[1.5rem] object-cover sm:h-[420px]"
          />

          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">
              Welcome to
            </p>

            <p className="mt-1 text-xl font-bold text-white">
              {village.name}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute inset-0 rounded-[2rem] bg-cyan-400/20 blur-3xl" />

      <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md sm:h-[420px]">
        <div className="text-center">
          <div className="text-8xl">🏡</div>
          <p className="mt-6 text-2xl font-black text-white">
            {village.name}
          </p>
          <p className="mt-2 text-sm text-blue-100">
            Village Community & Information
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="group border-b border-slate-100 p-6 transition hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-blue-950/20 sm:border-r lg:border-b-0">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl transition group-hover:scale-105 dark:bg-blue-950/40">
          {icon}
        </div>

        <div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div>
      {eyebrow && (
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between gap-5 py-4">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-bold text-slate-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}

function ReachCard({ icon, title, value }) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl transition group-hover:scale-105 dark:bg-blue-950/30">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
        {value}
      </p>
    </div>
  );
}

function PlaceCard({ place }) {
  const icon =
    PLACE_TYPE_ICONS[place.type] || PLACE_TYPE_ICONS.other;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      {place.imageUrl ? (
        <div className="relative overflow-hidden">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="h-52 w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {place.verified && (
            <span className="absolute right-4 top-4 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
              ✓ Verified
            </span>
          )}
        </div>
      ) : (
        <div className="flex h-52 items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 text-7xl dark:from-blue-950/30 dark:to-cyan-950/20">
          {icon}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
              {place.type
                ? place.type.replaceAll("_", " ")
                : "Village Place"}
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {place.name}
            </h3>
          </div>

          {!place.imageUrl && place.verified && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              ✓
            </span>
          )}
        </div>

        {place.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {place.description}
          </p>
        )}

        {place.address && (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            📍 {place.address}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-4">
          {place.distanceKm !== undefined &&
            place.distanceKm !== null && (
              <span className="text-xs font-medium text-slate-500">
                📏 {place.distanceKm} km
              </span>
            )}

          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              📞 Call
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function AboutSkeleton() {
  return (
    <main className="min-h-screen animate-pulse bg-slate-50 dark:bg-slate-950">
      <div className="h-[520px] bg-slate-800" />

      <div className="mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-32 rounded-3xl bg-white shadow-xl dark:bg-slate-900" />
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="h-80 rounded-3xl bg-white dark:bg-slate-900" />
          <div className="h-80 rounded-3xl bg-white dark:bg-slate-900" />
        </div>

        <div className="h-64 rounded-3xl bg-white dark:bg-slate-900" />
      </div>
    </main>
  );
}