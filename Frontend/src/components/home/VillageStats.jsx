import { useEffect, useState } from "react";
import api from "../../services/api";

const statConfig = [
  {
    key: "population",
    icon: "👥",
    label: "Population",
    description: "People living in Kakarcholi",
  },
  {
    key: "places",
    icon: "📍",
    label: "Places",
    description: "Important places & locations",
  },
  {
    key: "languages",
    icon: "🗣️",
    label: "Languages",
    description: "Languages spoken locally",
  },
  {
    key: "area",
    icon: "📐",
    label: "Village Area",
    description: "Total geographical area",
  },
];

export default function VillageStats() {
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadVillage = async () => {
      try {
        const res = await api.get("/village");

        if (mounted) {
          setVillage(res.data?.data || null);
        }
      } catch (error) {
        console.error("Failed to load village statistics:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadVillage();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statConfig.map((stat) => (
            <div
              key={stat.key}
              className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-white/90 shadow-lg dark:border-gray-700 dark:bg-gray-800/90"
            >
              <div className="p-6">
                <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="mt-4 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!village) {
    return null;
  }

  const places = Array.isArray(village.places)
    ? village.places.filter((place) => place?.isActive !== false)
    : [];

  const languages = Array.isArray(village.languages)
    ? village.languages
    : [];

  const stats = [
    {
      ...statConfig[0],
      value:
        village.population !== undefined &&
        village.population !== null &&
        village.population !== ""
          ? Number(village.population).toLocaleString()
          : "—",
    },
    {
      ...statConfig[1],
      value: places.length || "—",
    },
    {
      ...statConfig[2],
      value: languages.length || "—",
    },
    {
      ...statConfig[3],
      value:
        village.area !== undefined &&
        village.area !== null &&
        village.area !== ""
          ? `${village.area} km²`
          : "—",
    },
  ];

  return (
    <section className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-900/95">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.key}
                className={`
                  group relative p-6 sm:p-7
                  transition duration-300
                  hover:bg-primary-50/60
                  dark:hover:bg-primary-900/10
                  ${
                    index !== stats.length - 1
                      ? "border-b border-gray-100 dark:border-gray-800 sm:border-r"
                      : ""
                  }
                  ${
                    index === 1
                      ? "sm:border-b-0"
                      : index === 3
                      ? "sm:border-b-0"
                      : ""
                  }
                  lg:border-b-0
                  ${
                    index !== stats.length - 1
                      ? "lg:border-r"
                      : "lg:border-r-0"
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-2xl shadow-sm transition duration-300 group-hover:scale-105 group-hover:shadow-md dark:from-primary-900/30 dark:to-primary-800/20">
                    {stat.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0">
                    <p className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {stat.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                      {stat.description}
                    </p>
                  </div>
                </div>

                {/* Decorative line */}
                <div className="absolute bottom-0 left-6 h-0.5 w-0 bg-primary-500 transition-all duration-300 group-hover:w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}