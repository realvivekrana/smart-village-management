import { useEffect, useState } from "react";
import { getServices } from "../../services/serviceService";
import ServiceCard from "../../components/services/ServiceCard";
import ServiceFilters from "../../components/services/ServiceFilters";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import useDebounce from "../../hooks/useDebounce";

export default function Services() {
  const [filters, setFilters] = useState({ search: "", category: "" });
  const [page, setPage] = useState(1);
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => { setPage(1); }, [debouncedSearch, filters.category]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getServices({ page, limit: 9, search: debouncedSearch, category: filters.category })
      .then((res) => {
        if (!active) return;
        setServices(res.data.data.services);
        setPagination(res.data.pagination);
      })
      .catch((err) => active && setError(err.response?.data?.message || "Failed to load services"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [page, debouncedSearch, filters.category]);

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">🔧 Government Services</h1>
      <ServiceFilters filters={filters} onChange={setFilters} />
      <div>
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => setPage((p) => p)} />
        ) : services.length === 0 ? (
          <EmptyState icon="🔧" title="No services found" description="Try a different category." />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => <ServiceCard key={s._id} service={s} />)}
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}