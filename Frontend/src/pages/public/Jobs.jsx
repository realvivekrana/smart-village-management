import { useEffect, useState } from "react";
import { getJobs } from "../../services/jobService";
import JobCard from "../../components/jobs/JobCard";
import JobFilters from "../../components/jobs/JobFilters";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import useDebounce from "../../hooks/useDebounce";

export default function Jobs() {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    type: "",
  });

  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.category, filters.type]);

  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getJobs({
          page,
          limit: 9,
          search: debouncedSearch,
          category: filters.category,
          type: filters.type,
        });

        if (!active) return;

        setJobs(res.data?.data?.jobs || []);
        setPagination(res.data?.pagination || null);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load job opportunities. Please try again."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, filters.category, filters.type]);

  const handleRetry = () => {
    setError(null);
    setPage((currentPage) => currentPage);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    Boolean(filters.type);

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      type: "",
    });
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-200/70 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 dark:border-gray-800">
        {/* Decorative elements */}
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <span className="text-lg">💼</span>
              <span>Kakarcholi Career Opportunities</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Your Next
              <span className="block text-blue-200">
                Opportunity
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              Discover local jobs, employment opportunities and career openings
              available for the Kakarcholi community.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-sm">
                🔎 Search Jobs
              </div>

              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-sm">
                📍 Local Opportunities
              </div>

              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-sm">
                🚀 Build Your Career
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Heading */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Career Center
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Explore Job Opportunities
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
              Search and filter available opportunities to find a job that
              matches your skills and interests.
            </p>
          </div>

          {!loading && !error && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
              <span>💼</span>
              <span>
                {jobs.length} {jobs.length === 1 ? "job" : "jobs"} shown
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                🔍 Find a Job
              </h3>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Search by keyword, category or employment type.
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

          <JobFilters
            filters={filters}
            onChange={handleFilterChange}
          />
        </div>

        {/* Results */}
        <div>
          {loading ? (
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Finding available jobs...
                </p>
              </div>

              <Loader />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/40 dark:bg-gray-800">
              <ErrorMessage
                message={error}
                onRetry={handleRetry}
              />
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-4xl dark:bg-blue-900/20">
                💼
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                No jobs found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                We couldn't find any opportunities matching your current
                search. Try changing your filters or searching for another
                keyword.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                >
                  Reset Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Result header */}
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Available Opportunities
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing the latest jobs available in the community.
                  </p>
                </div>

                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {filters.search && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        Search: {filters.search}
                      </span>
                    )}

                    {filters.category && (
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                        Category: {filters.category}
                      </span>
                    )}

                    {filters.type && (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300">
                        Type: {filters.type}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Job grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="group transition duration-300 hover:-translate-y-1"
                  >
                    <JobCard job={job} />
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

      {/* Bottom CTA */}
      <section className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-10 text-center shadow-xl sm:px-10">
            <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-purple-400/20 blur-2xl" />

            <div className="relative">
              <div className="mb-3 text-3xl">🚀</div>

              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Your Next Opportunity Could Be Here
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Keep checking the Kakarcholi job portal for new local
                opportunities and career openings.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}