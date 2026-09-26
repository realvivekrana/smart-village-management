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

  const debouncedSearch = useDebounce(
    filters.search,
    400
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.category]);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    getBusinesses({
      page,
      limit: 9,
      search: debouncedSearch,
      category: filters.category,
    })
      .then((res) => {
        if (!active) return;

        const responseData = res?.data;

        const businessesData =
          responseData?.data?.businesses ??
          responseData?.businesses ??
          [];

        const paginationData =
          responseData?.pagination ??
          responseData?.data?.pagination ??
          null;

        setBusinesses(
          Array.isArray(businessesData)
            ? businessesData
            : []
        );

        setPagination(paginationData);
      })
      .catch((err) => {
        if (!active) return;

        setError(
          err?.response?.data?.message ||
            "Failed to load businesses"
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    page,
    debouncedSearch,
    filters.category,
  ]);

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">
        🏪 Local Businesses
      </h1>

      <BusinessFilters
        filters={filters}
        onChange={setFilters}
      />

      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={() => {
              setPage((currentPage) => currentPage);
            }}
          />
        ) : businesses.length === 0 ? (
          <EmptyState
            icon="🏪"
            title="No businesses found"
            description="Try adjusting your search or check back later."
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <BusinessCard
                  key={business._id}
                  business={business}
                />
              ))}
            </div>

            <Pagination
              pagination={pagination}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}