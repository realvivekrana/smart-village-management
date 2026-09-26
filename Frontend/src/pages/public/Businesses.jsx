import { useEffect, useState } from "react";
import { getBusinesses } from "../../services/businessService";
import BusinessCard from "../../components/business/BusinessCard";
import BusinessFilters from "../../components/business/BusinessFilters";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import useDebounce from "../../hooks/useDebounce";

export default function Businesses() {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
  });

  const [page, setPage] = useState(1);
  const [businesses, setBusinesses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.category]);

  useEffect(() => {
    let active = true;

    const loadBusinesses = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getBusinesses({
          page,
          limit: 9,
          search: debouncedSearch,
          category: filters.category,
        });

        if (!active) return;

        setBusinesses(res.data?.data?.businesses || []);
        setPagination(res.data?.pagination || null);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load local businesses. Please try again."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadBusinesses();

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, filters.category]);

  const hasActiveFilters =
    Boolean(filters.search) || Boolean(filters.category);

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
    });

    setPage(1);
  };

  const handleRetry = () => {
    setError(null);
    setPage((currentPage) => currentPage);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-red-700">
        {/* Decorative circles */}
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute right-[-100px] top-10 h-80 w-80 rounded-full bg-yellow-300/20 blur-3xl" />

        <div className="absolute bottom-[-120px] left-1/3 h-72 w-72 rounded-full bg-red-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-md">
              <span className="text-lg">🏪</span>
              <span>Kakarcholi Local Business Directory</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Discover
              <span className="block text-orange-100">
                Local Businesses
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-2xl text-base leading-7 text-orange-50 sm:text-lg">
              Explore shops, services, professionals and local businesses
              around the Kakarcholi community — all in one place.
            </p>

            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-sm">
                🔎 Easy Search
              </div>

              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-sm">
                🏪 Local Shops
              </div>

              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-sm">
                🤝 Support Local
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Section heading */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Business Directory
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Explore Local Businesses
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
              Find useful shops, services and businesses available in and
              around Kakarcholi.
            </p>
          </div>

          {!loading && !error && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-300">
              <span>🏪</span>

              <span>
                {businesses.length}{" "}
                {businesses.length === 1 ? "business" : "businesses"} shown
              </span>
            </div>
          )}
        </div>

        {/* =========================================================
            FILTER PANEL
        ========================================================== */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                🔍 Find a Business
              </h3>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Search businesses or filter them by category.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Clear filters
              </button>
            )}
          </div>

          <BusinessFilters
            filters={filters}
            onChange={setFilters}
          />
        </div>

        {/* =========================================================
            RESULTS
        ========================================================== */}
        <div>
          {/* Loading */}
          {loading ? (
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />

                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Finding local businesses...
                </p>
              </div>

              <Loader />
            </div>
          ) : error ? (
            /* Error */
            <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/40 dark:bg-gray-800">
              <ErrorMessage
                message={error}
                onRetry={handleRetry}
              />
            </div>
          ) : businesses.length === 0 ? (
            /* Empty */
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-4xl dark:bg-orange-900/20">
                🏪
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                No businesses found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                We couldn't find any businesses matching your current search.
                Try another keyword or category.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 hover:shadow-md"
                >
                  Reset Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Result header */}
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Local Businesses
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Discover businesses serving the Kakarcholi community.
                  </p>
                </div>

                {/* Active filters */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {filters.search && (
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                        Search: {filters.search}
                      </span>
                    )}

                    {filters.category && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        Category: {filters.category}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Business cards */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {businesses.map((business) => (
                  <div
                    key={business._id}
                    className="group transition duration-300 hover:-translate-y-1"
                  >
                    <BusinessCard business={business} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && (
                <div className="mt-10 border-t border-gray-200 pt-8 dark:border-gray-800">
                  <Pagination
                    pagination={pagination}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* =========================================================
          SUPPORT LOCAL CTA
      ========================================================== */}
      <section className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 px-6 py-10 text-center shadow-xl sm:px-10">
            {/* Decorative */}
            <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-yellow-300/20 blur-2xl" />

            <div className="relative">
              <div className="mb-3 text-3xl">🤝</div>

              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Support Local Businesses
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-orange-100 sm:text-base">
                Local businesses are an important part of the Kakarcholi
                community. Discover, connect and support businesses around you.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}