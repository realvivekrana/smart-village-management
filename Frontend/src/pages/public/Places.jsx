import React, { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const categories = [
  { value: "all", label: "All Places" },
  { value: "school", label: "Schools" },
  { value: "college", label: "Colleges" },
  { value: "hospital", label: "Hospitals" },
  { value: "health_center", label: "Health Centers" },
  { value: "temple", label: "Temples" },
  { value: "mosque", label: "Mosques" },
  { value: "church", label: "Churches" },
  { value: "railway_station", label: "Railway Stations" },
  { value: "bus_stop", label: "Bus Stops" },
  { value: "atm", label: "ATMs" },
  { value: "petrol_pump", label: "Petrol Pumps" },
  { value: "market", label: "Markets" },
  { value: "restaurant", label: "Restaurants" },
  { value: "hotel", label: "Hotels" },
  { value: "police_station", label: "Police Stations" },
  { value: "government_office", label: "Government Offices" },
  { value: "park", label: "Parks" },
  { value: "tourist_place", label: "Tourist Places" },
  { value: "other", label: "Other" },
];

const Places = () => {
  const [village, setVillage] = useState(null);
  const [places, setPlaces] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const fetchVillage = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/village`);

        if (!response.ok) {
          throw new Error(
            `Failed to load village data (${response.status})`
          );
        }

        const result = await response.json();

        const data =
          result?.data ||
          result?.village ||
          result;

        setVillage(data);

        const villagePlaces = Array.isArray(data?.places)
          ? data.places
          : [];

        setPlaces(
          villagePlaces.filter(
            (place) => place.isActive !== false
          )
        );
      } catch (err) {
        console.error("Places page error:", err);

        setError(
          err.message ||
            "Unable to load village places."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVillage();
  }, []);

  const filteredPlaces = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return places.filter((place) => {
      const matchesSearch =
        !keyword ||
        String(place.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(place.address || "")
          .toLowerCase()
          .includes(keyword) ||
        String(place.description || "")
          .toLowerCase()
          .includes(keyword);

      const matchesCategory =
        category === "all" ||
        place.type === category;

      return matchesSearch && matchesCategory;
    });
  }, [places, search, category]);

  const categoryCounts = useMemo(() => {
    return categories.reduce((result, item) => {
      if (item.value === "all") {
        result[item.value] = places.length;
      } else {
        result[item.value] = places.filter(
          (place) => place.type === item.value
        ).length;
      }

      return result;
    }, {});
  }, [places]);

  if (loading) {
    return (
      <main className="min-h-[500px] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading village places...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[500px] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to Load Places
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-700 to-cyan-600">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
            Village Directory
          </p>

          <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">
            Places in {village?.name || "Our Village"}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">
            Find schools, hospitals, temples, markets,
            railway stations and other important places
            around the village.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="relative z-10 mx-auto -mt-7 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-5 shadow-xl">
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search Places
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search school, hospital, temple..."
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {categories.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                    {categoryCounts[item.value] !==
                      undefined
                      ? ` (${categoryCounts[item.value]})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Category Buttons */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                setCategory(item.value)
              }
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                category === item.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {item.label}

              <span
                className={`ml-1.5 ${
                  category === item.value
                    ? "text-blue-100"
                    : "text-gray-400"
                }`}
              >
                {categoryCounts[item.value] || 0}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {category === "all"
                ? "All Places"
                : categories.find(
                    (item) => item.value === category
                  )?.label}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredPlaces.length} place
              {filteredPlaces.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          {(search || category !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredPlaces.length === 0 ? (
          <EmptyState
            search={search}
            category={category}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.map((place) => (
              <PlaceCard
                key={place._id || place.name}
                place={place}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

const PlaceCard = ({ place }) => {
  const categoryLabel =
    categories.find(
      (item) => item.value === place.type
    )?.label || "Other";

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
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      {place.imageUrl ? (
        <div className="relative h-52 overflow-hidden bg-gray-100">
          <img
            src={place.imageUrl}
            alt={place.name || "Village place"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {place.verified && (
            <span className="absolute right-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow">
              ✓ Verified
            </span>
          )}
        </div>
      ) : (
        <div className="relative flex h-52 items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
          <span className="text-6xl">
            {getPlaceIcon(place.type)}
          </span>

          {place.verified && (
            <span className="absolute right-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow">
              ✓ Verified
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              {categoryLabel}
            </p>

            <h3 className="mt-1 text-lg font-bold text-gray-900">
              {place.name}
            </h3>
          </div>
        </div>

        {place.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
            {place.description}
          </p>
        )}

        <div className="mt-4 space-y-2">
          {place.address && (
            <div className="flex gap-2 text-sm text-gray-500">
              <span>📍</span>
              <span className="line-clamp-2">
                {place.address}
              </span>
            </div>
          )}

          {place.distanceKm !== undefined &&
            place.distanceKm !== null && (
              <div className="flex gap-2 text-sm text-gray-500">
                <span>📏</span>
                <span>
                  {place.distanceKm} km away
                </span>
              </div>
            )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              📞 Call
            </a>
          )}

          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
            >
              🗺️ View Map
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

const EmptyState = ({
  search,
  category,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <div className="text-5xl">📍</div>

      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No places found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {search
          ? `No place matches "${search}". Try a different search term.`
          : category !== "all"
          ? "No places are available in this category yet."
          : "Village places will be added here soon."}
      </p>
    </div>
  );
};

const getPlaceIcon = (type) => {
  const icons = {
    school: "🏫",
    college: "🎓",
    hospital: "🏥",
    health_center: "⚕️",
    temple: "🛕",
    mosque: "🕌",
    church: "⛪",
    railway_station: "🚆",
    bus_stop: "🚌",
    atm: "🏧",
    petrol_pump: "⛽",
    market: "🛒",
    restaurant: "🍽️",
    hotel: "🏨",
    police_station: "👮",
    government_office: "🏛️",
    park: "🌳",
    tourist_place: "📸",
    other: "📍",
  };

  return icons[type] || icons.other;
};

export default Places;