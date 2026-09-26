import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const AboutVillage = () => {
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVillage = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/village`);

        if (!response.ok) {
          throw new Error("Unable to load village information");
        }

        const result = await response.json();

        const data =
          result?.data ||
          result?.village ||
          result;

        if (!data || !data._id) {
          throw new Error("Village information not found");
        }

        setVillage(data);
      } catch (err) {
        console.error("About village error:", err);

        setError(
          err.message ||
            "Failed to load village information"
        );
      } finally {
        setLoading(false);
      }
    };

    loadVillage();
  }, []);

  if (loading) {
    return (
      <main className="min-h-[500px] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading village information...
          </p>
        </div>
      </main>
    );
  }

  if (error || !village) {
    return (
      <main className="min-h-[500px] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-700">
            Village Information Unavailable
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || "No village information available."}
          </p>
        </div>
      </main>
    );
  }

  const howToReach = village.howToReach || {};
  const sarpanch = village.sarpanch || {};

  const languages = Array.isArray(village.languages)
    ? village.languages
    : [];

  const rivers = Array.isArray(village.rivers)
    ? village.rivers
    : [];

  const places = Array.isArray(village.places)
    ? village.places
    : [];

  const images = Array.isArray(village.images)
    ? village.images
    : [];

  const activePlaces = places.filter(
    (place) => place.isActive !== false
  );

  const nearbyGroups = [
    { label: "Nearby Villages", icon: "🏘️", items: village.nearbyVillages },
    { label: "Nearby Cities", icon: "🏙️", items: village.nearbyCities },
    { label: "Nearby Blocks / Taluks", icon: "🧭", items: village.nearbyTaluks },
    { label: "Nearby Districts", icon: "🗺️", items: village.nearbyDistricts },
    { label: "Nearby Railway Stations", icon: "🚆", items: village.nearbyRailwayStations },
    { label: "Nearby Airports", icon: "✈️", items: village.nearbyAirports },
    { label: "Nearby Tourist Places", icon: "📸", items: village.nearbyTouristPlaces },
  ].filter((group) => Array.isArray(group.items) && group.items.length > 0);

  return (
    <main className="bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600">
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-100">
              Smart Village Management
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {village.name}
            </h1>

            {village.localName && (
              <p className="mt-3 text-xl text-blue-100">
                {village.localName}
              </p>
            )}

            <p className="mt-6 max-w-3xl text-base leading-8 text-blue-50 sm:text-lg">
              {village.description ||
                `Welcome to ${village.name}. Explore information about the village, its history, connectivity, facilities and important places.`}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {village.district && (
                <Badge>
                  📍 {village.district}
                </Badge>
              )}

              {village.state && (
                <Badge>
                  🗺️ {village.state}
                </Badge>
              )}

              {village.pincode && (
                <Badge>
                  📮 {village.pincode}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Statistics */}
      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl bg-white shadow-xl sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Population"
            value={
              village.population
                ? Number(village.population).toLocaleString()
                : "—"
            }
            icon="👥"
          />

          <Stat
            label="Area"
            value={
              village.area
                ? `${village.area} km²`
                : "—"
            }
            icon="📐"
          />

          <Stat
            label="Important Places"
            value={activePlaces.length}
            icon="📍"
          />

          <Stat
            label="Languages"
            value={languages.length}
            icon="🗣️"
          />
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <SectionTitle
              eyebrow="About"
              title={`About ${village.name}`}
            />

            <div className="mt-6 space-y-5 text-base leading-8 text-gray-600">
              <p>
                {village.description ||
                  `Information about ${village.name} will be displayed here.`}
              </p>

              {village.history && (
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    History
                  </h3>

                  <p className="whitespace-pre-line">
                    {village.history}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Village Details
            </h2>

            <div className="mt-5 divide-y divide-gray-100">
              <Detail
                label="Village"
                value={village.name}
              />

              <Detail
                label="Block"
                value={village.block}
              />

              <Detail
                label="District"
                value={village.district}
              />

              <Detail
                label="State"
                value={village.state}
              />

              <Detail
                label="PIN Code"
                value={village.pincode}
              />

              <Detail
                label="STD Code"
                value={village.stdCode}
              />

              <Detail
                label="Altitude"
                value={
                  village.altitude
                    ? `${village.altitude} m`
                    : ""
                }
              />

              <Detail
                label="Assembly Constituency"
                value={village.assemblyConstituency}
              />

              <Detail
                label="Lok Sabha Constituency"
                value={village.lokSabhaConstituency}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Languages */}
      {languages.length > 0 && (
        <section className="border-y border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Culture"
              title="Languages Spoken"
            />

            <div className="mt-6 flex flex-wrap gap-3">
              {languages.map((language) => (
                <span
                  key={language}
                  className="rounded-full bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-700"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How To Reach */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Connectivity"
          title={`How to Reach ${village.name}`}
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <ReachCard
            icon="🚗"
            title="By Road"
            value={
              howToReach.road ||
              "Road connectivity information will be updated soon."
            }
          />

          <ReachCard
            icon="🚆"
            title="By Rail"
            value={
              howToReach.rail ||
              "Railway connectivity information will be updated soon."
            }
          />

          <ReachCard
            icon="✈️"
            title="By Air"
            value={
              howToReach.air ||
              "Airport connectivity information will be updated soon."
            }
          />
        </div>
      </section>

      {/* Map */}
      {village.location?.lat && village.location?.lng && (
        <section className="border-y border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle
                eyebrow="Find Us"
                title="Village Location"
              />

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${village.location.lat},${village.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Open in Google Maps ↗
              </a>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <iframe
                title={`${village.name} location map`}
                src={`https://www.google.com/maps?q=${village.location.lat},${village.location.lng}&hl=en&z=13&output=embed`}
                className="h-96 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      )}

      {/* Rivers */}
      {rivers.length > 0 && (
        <section className="bg-cyan-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Nature"
              title="Rivers & Water Bodies"
            />

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {rivers.map((river) => (
                <div
                  key={river}
                  className="rounded-xl border border-cyan-100 bg-white p-5 shadow-sm"
                >
                  <div className="text-2xl">💧</div>

                  <h3 className="mt-3 font-semibold text-gray-900">
                    {river}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nearby Villages, Cities & Connectivity */}
      {nearbyGroups.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Around the Village"
            title="Nearby Places & Connectivity"
          />

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {nearbyGroups.map((group) => (
              <div
                key={group.label}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <span>{group.icon}</span>
                  {group.label}
                </h3>

                <ul className="mt-4 space-y-2">
                  {group.items
                    .slice()
                    .sort(
                      (a, b) =>
                        (a.distanceKm ?? 0) - (b.distanceKm ?? 0)
                    )
                    .map((item) => (
                      <li
                        key={`${group.label}-${item.name}`}
                        className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm last:border-b-0 last:pb-0"
                      >
                        <span className="text-gray-700">
                          {item.name}
                        </span>

                        {item.distanceKm !== undefined &&
                          item.distanceKm !== null && (
                            <span className="shrink-0 text-xs font-medium text-gray-400">
                              {item.distanceKm} km
                            </span>
                          )}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Important Places */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            eyebrow="Directory"
            title="Important Places"
          />

          <span className="text-sm text-gray-500">
            {activePlaces.length} places
          </span>
        </div>

        {activePlaces.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <div className="text-3xl">📍</div>

            <p className="mt-3 text-sm text-gray-500">
              Important places will be added soon.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activePlaces.slice(0, 9).map((place) => (
              <PlaceCard
                key={place._id || place.name}
                place={place}
              />
            ))}
          </div>
        )}

        {activePlaces.length > 9 && (
          <div className="mt-8 text-center">
            <Link
              to="/village-places"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              View All {activePlaces.length} Places →
            </Link>
          </div>
        )}
      </section>

      {/* Sarpanch */}
      {(sarpanch.name || sarpanch.phone) && (
        <section className="border-y border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Administration"
              title="Village Representative"
            />

            <div className="mt-6 max-w-xl rounded-2xl border border-gray-200 bg-gray-50 p-6">
              {sarpanch.name && (
                <h3 className="text-xl font-bold text-gray-900">
                  {sarpanch.name}
                </h3>
              )}

              {sarpanch.phone && (
                <a
                  href={`tel:${sarpanch.phone}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  📞 {sarpanch.phone}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {images.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Gallery"
            title={`${village.name} Gallery`}
          />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {images.map((image, index) => {
              const imageUrl =
                typeof image === "string"
                  ? image
                  : image?.url;

              if (!imageUrl) return null;

              return (
                <figure
                  key={`${imageUrl}-${index}`}
                  className="group overflow-hidden rounded-2xl bg-gray-100"
                >
                  <img
                    src={imageUrl}
                    alt={
                      typeof image === "string"
                        ? village.name
                        : image.caption ||
                          village.name
                    }
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {typeof image !== "string" &&
                    image.caption && (
                      <figcaption className="bg-white p-4 text-sm text-gray-600">
                        {image.caption}
                      </figcaption>
                    )}
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Discover {village.name}
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Explore village information, local facilities,
            connectivity and important places through the
            Smart Village Management platform.
          </p>
        </div>
      </section>
    </main>
  );
};

/*
|--------------------------------------------------------------------------
| Reusable Components
|--------------------------------------------------------------------------
*/

const SectionTitle = ({
  eyebrow,
  title,
}) => {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
        {title}
      </h2>
    </div>
  );
};

const Badge = ({ children }) => {
  return (
    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
      {children}
    </span>
  );
};

const Stat = ({
  label,
  value,
  icon,
}) => {
  return (
    <div className="border-b border-gray-100 p-6 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
          {icon}
        </div>

        <div>
          <p className="text-2xl font-bold text-gray-900">
            {value}
          </p>

          <p className="mt-0.5 text-sm text-gray-500">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
};

const Detail = ({
  label,
  value,
}) => {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
};

const ReachCard = ({
  icon,
  title,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-600">
        {value}
      </p>
    </div>
  );
};

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

const PlaceCard = ({ place }) => {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {place.imageUrl ? (
        <img
          src={place.imageUrl}
          alt={place.name}
          className="h-44 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-44 items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 text-5xl">
          {PLACE_TYPE_ICONS[place.type] || PLACE_TYPE_ICONS.other}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-gray-900">
            {place.name}
          </h3>

          {place.verified && (
            <span
              title="Verified"
              className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-xs text-green-700"
            >
              ✓
            </span>
          )}
        </div>

        {place.type && (
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-blue-600">
            {place.type.replaceAll("_", " ")}
          </p>
        )}

        {place.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
            {place.description}
          </p>
        )}

        {place.address && (
          <p className="mt-3 text-sm text-gray-500">
            📍 {place.address}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {place.distanceKm !== undefined &&
            place.distanceKm !== null && (
              <span className="text-xs text-gray-500">
                📏 {place.distanceKm} km
              </span>
            )}

          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              📞 Call
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default AboutVillage;