import { useEffect, useState } from "react";
import { getServices } from "../../services/serviceService";
import ServiceFilters from "../../components/services/ServiceFilters";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import useDebounce from "../../hooks/useDebounce";

const serviceIcons = {
  certificate: "📜",
  license: "🪪",
  document: "📄",
  government: "🏛️",
  education: "🎓",
  health: "🏥",
  agriculture: "🌾",
  welfare: "🤝",
  other: "🔧",
};

export default function Services() {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
  });

  const [page, setPage] = useState(1);
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.category]);

  useEffect(() => {
    let active = true;

    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getServices({
          page,
          limit: 9,
          search: debouncedSearch,
          category: filters.category,
        });

        if (!active) return;

        setServices(res.data?.data?.services || []);
        setPagination(res.data?.pagination || null);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Failed to load government services"
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, filters.category]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 opacity-[0.96]" />

        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              🏛️ Village Digital Services
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Government
              <span className="block text-cyan-100">
                Services
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-cyan-50 sm:text-lg">
              Explore important government and village services available
              for the residents of Kakarcholi.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
                📄 Certificates
              </div>

              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
                🪪 Licenses
              </div>

              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
                🏥 Health Services
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Digital Access
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Available Services
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Find the service you need quickly and easily.
            </p>
          </div>

          {!loading && services.length > 0 && (
            <div className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
              {pagination?.total || services.length} Services
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5">
          <ServiceFilters
            filters={filters}
            onChange={setFilters}
          />
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white py-12 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <Loader />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900/40 dark:bg-red-900/10">
              <ErrorMessage
                message={error}
                onRetry={() => setPage((p) => p)}
              />
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white py-12 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <EmptyState
                icon="🏛️"
                title="No services found"
                description="Try changing your search or category filter."
              />
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {services.map((service) => {
                  const category =
                    String(service.category || "other").toLowerCase();

                  const icon =
                    service.icon ||
                    serviceIcons[category] ||
                    "🔧";

                  return (
                    <ServiceCard
                      key={service._id}
                      service={service}
                      icon={icon}
                    />
                  );
                })}

              </div>

              <div className="mt-10">
                <Pagination
                  pagination={pagination}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}


/* -------------------------------------------------------
   Service Card
------------------------------------------------------- */

function ServiceCard({ service, icon }) {
  const category = service.category || "Other";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-teal-700">

      {/* Top Accent */}
      <div className="h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />

      <div className="p-6">

        {/* Icon + Category */}
        <div className="flex items-start justify-between gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-100 text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110 dark:from-teal-900/30 dark:to-cyan-900/30">
            {icon}
          </div>

          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold capitalize text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
            {category.replace(/_/g, " ")}
          </span>

        </div>

        {/* Title */}
        <h3 className="mt-5 line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">
          {service.name || service.title || "Village Service"}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {service.description ||
            "Information and assistance for this village service."}
        </p>

        {/* Details */}
        <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-700">

          {service.department && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>🏢</span>
              <span className="truncate">
                {service.department}
              </span>
            </div>
          )}

          {service.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>📍</span>
              <span className="truncate">
                {service.location}
              </span>
            </div>
          )}

          {service.contact && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>📞</span>
              <span className="truncate">
                {service.contact}
              </span>
            </div>
          )}

        </div>

        {/* Action */}
        <div className="mt-6">

          {service._id ? (
            <a
              href={`/services/${service._id}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-600 dark:bg-gray-700 dark:hover:bg-teal-600"
            >
              View Service
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
          ) : (
            <div className="rounded-xl bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              Service information
            </div>
          )}

        </div>

      </div>
    </div>
  );
}