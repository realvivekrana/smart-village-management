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
  const [filters, setFilters] = useState({ search: "", category: "", type: "" });
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => { setPage(1); }, [debouncedSearch, filters.category, filters.type]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getJobs({ page, limit: 9, search: debouncedSearch, category: filters.category, type: filters.type })
      .then((res) => {
        if (!active) return;
        setJobs(res.data.data.jobs);
        setPagination(res.data.pagination);
      })
      .catch((err) => active && setError(err.response?.data?.message || "Failed to load jobs"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [page, debouncedSearch, filters.category, filters.type]);

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">💼 Local Job Opportunities</h1>
      <JobFilters filters={filters} onChange={setFilters} />
      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => setPage((p) => p)} />
        ) : jobs.length === 0 ? (
          <EmptyState icon="💼" title="No jobs found" description="Check back later or adjust your filters." />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((j) => <JobCard key={j._id} job={j} />)}
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}