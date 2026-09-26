import { useEffect, useState } from "react";
import api from "../../services/api";

/**
 * Homepage stats strip — fully dynamic, no hardcoded numbers.
 * Backend returns { success, data: <village> } so stats come from
 * res.data.data directly (NOT res.data.data.village — that bug was
 * fixed in AboutVillage.jsx / VillagePlaces.jsx too).
 */
export default function VillageStats() {
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/village")
      .then((res) => {
        setVillage(res.data?.data || null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load village stats");
      })
      .finally(() => setLoading(false));
  }, []);

  const places = Array.isArray(village?.places) ? village.places : [];
  const activePlaces = places.filter((p) => p.isActive !== false);

  const stats = [
    {
      icon: "👥",
      label: "Population",
      value: village?.population
        ? Number(village.population).toLocaleString()
        : "—",
    },
    {
      icon: "📍",
      label: "Important Places",
      value: activePlaces.length || "—",
    },
    {
      icon: "🗣️",
      label: "Languages",
      value: Array.isArray(village?.languages) ? village.languages.length : "—",
    },
    {
      icon: "📐",
      label: "Area",
      value: village?.area ? `${village.area} km²` : "—",
    },
  ];

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error || !village) {
    // Fail quietly on the homepage rather than showing an error banner
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-b border-gray-100 p-6 last:border-b-0 dark:border-gray-700 sm:border-r sm:last:border-r-0 lg:border-b-0"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-900/30">
                {stat.icon}
              </div>

              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>

                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}