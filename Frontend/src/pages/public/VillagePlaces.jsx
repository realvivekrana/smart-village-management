import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";

const CATEGORIES = [
  { value: "all", label: "All Places", icon: "🗺️" },
  { value: "school", label: "Schools", icon: "🏫" },
  { value: "college", label: "Colleges", icon: "🎓" },
  { value: "hospital", label: "Hospitals", icon: "🏥" },
  { value: "health_center", label: "Health Centers", icon: "⚕️" },
  { value: "temple", label: "Temples", icon: "🛕" },
  { value: "mosque", label: "Mosques", icon: "🕌" },
  { value: "church", label: "Churches", icon: "⛪" },
  { value: "railway_station", label: "Railway Stations", icon: "🚆" },
  { value: "bus_stop", label: "Bus Stops", icon: "🚌" },
  { value: "atm", label: "ATMs", icon: "🏧" },
  { value: "petrol_pump", label: "Petrol Pumps", icon: "⛽" },
  { value: "market", label: "Markets", icon: "🛒" },
  { value: "super_market", label: "Super Markets", icon: "🛍️" },
  { value: "restaurant", label: "Restaurants", icon: "🍽️" },
  { value: "hotel", label: "Hotels", icon: "🏨" },
  { value: "cinema", label: "Cinema", icon: "🎬" },
  { value: "electronic_shop", label: "Electronic Shops", icon: "🔌" },
  { value: "police_station", label: "Police Stations", icon: "👮" },
  { value: "government_office", label: "Government Offices", icon: "🏛️" },
  { value: "park", label: "Parks", icon: "🌳" },
  { value: "water_body", label: "Water Bodies", icon: "💧" },
  { value: "tourist_place", label: "Tourist Places", icon: "📸" },
  { value: "other", label: "Other", icon: "📍" },
];

const iconFor = (type) =>
  CATEGORIES.find((c) => c.value === type)?.icon || "📍";

const labelFor = (type) =>
  CATEGORIES.find((c) => c.value === type)?.label || "Other";

export default function VillagePlaces() {
  const [places, setPlaces] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const load = () => {
    setLoading(true);
    setError(null);

    api
      .get("/village")
      .then((res) => {
        // Backend returns { success, data: <village> } - places live on data.places
        const village = res.data?.data;
        const villagePlaces = Array.isArray(village?.places)
          ? village.places
          : [];

        setPlaces(villagePlaces.filter((p) => p.isActive !== false));
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load places")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const categoryCounts = useMemo(() => {
    const list = places || [];

    return CATEGORIES.reduce((acc, item) => {
      acc[item.value] =
        item.value === "all"
          ? list.length
          : list.filter((p) => p.type === item.value).length;

      return acc;
    }, {});
  }, [places]);

  const filteredPlaces = useMemo(() => {
    const list = places || [];
    const keyword = search.trim().toLowerCase();

    return list.filter((p) => {
      const matchesSearch =
        !keyword ||
        String(p.name || "").toLowerCase().includes(keyword) ||
        String(p.address || "").toLowerCase().includes(keyword);

      const matchesCategory = category === "all" || p.type === category;

      return matchesSearch && matchesCategory;
    });
  }, [places, search, category]);

  if (loading) return <Loader fullScreen />;

  if (error)
    return (
      <div className="page-container">
        <ErrorMessage message={error} onRetry={load} />
      </div>
    );

  return (
    <div className="page-container">
      <h1 className="section-title mb-2">🗺️ Places of Interest</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {filteredPlaces.length} place{filteredPlaces.length !== 1 ? "s" : ""}
        {category !== "all" ? ` in ${labelFor(category)}` : ""}
      </p>

      {/* Search + Category filter */}
      <div className="card mb-6 grid gap-4 p-4 lg:grid-cols-[1fr_260px]">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or address..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.icon} {item.label} ({categoryCounts[item.value] ?? 0})
            </option>
          ))}
        </select>
      </div>

      {/* Category chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.filter(
          (item) => item.value === "all" || categoryCounts[item.value] > 0
        ).map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setCategory(item.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              category === item.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {item.icon} {item.label} ({categoryCounts[item.value] ?? 0})
          </button>
        ))}
      </div>

      {!filteredPlaces || filteredPlaces.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title="No places found"
          description={
            search || category !== "all"
              ? "Try a different search term or category."
              : "Village places will show up here once added by the admin."
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlaces.map((p) => (
            <PlaceCard key={p._id || p.name} place={p} />
          ))}
        </div>
      )}
    </div>
  );
}

const PlaceCard = ({ place }) => {
  const hasCoordinates =
    place.coordinates?.lat !== undefined &&
    place.coordinates?.lng !== undefined;

  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}`
    : place.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        place.address
      )}`
    : "";

  return (
    <div className="card overflow-hidden p-0">
      {place.imageUrl ? (
        <img
          src={place.imageUrl}
          alt={place.name}
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 text-5xl dark:from-gray-700 dark:to-gray-800">
          {iconFor(place.type)}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="badge badge-blue mb-1 inline-block text-xs capitalize">
              {labelFor(place.type)}
            </span>

            <h3 className="font-semibold text-gray-900 dark:text-white">
              {place.name}
            </h3>
          </div>

          {place.verified && (
            <span
              title="Verified"
              className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
            >
              ✓
            </span>
          )}
        </div>

        {place.description && (
          <p className="mt-2 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
            {place.description}
          </p>
        )}

        <div className="mt-3 space-y-1.5">
          {place.address && (
            <p className="flex gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <span>📍</span>
              <span className="line-clamp-2">{place.address}</span>
            </p>
          )}

          {place.distanceKm !== undefined && place.distanceKm !== null && (
            <p className="flex gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <span>📏</span>
              <span>{place.distanceKm} km away</span>
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {place.phone && (
            
              href={`tel:${place.phone}`}
              className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
            >
              📞 Call
            </a>
          )}

          {mapUrl && (
            
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            >
              🗺️ View Map
            </a>
          )}
        </div>
      </div>
    </div>
  );
};