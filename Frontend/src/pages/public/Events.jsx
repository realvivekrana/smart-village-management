import { useEffect, useState } from "react";
import { getEvents } from "../../services/eventService";
import { EVENT_CATEGORIES } from "../../utils/constants";
import EventCard from "../../components/events/EventCard";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import useDebounce from "../../hooks/useDebounce";

export default function Events() {
  const [filters, setFilters] = useState({ search: "", category: "", upcoming: "true" });
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 400);
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => { setPage(1); }, [debouncedSearch, filters.category, filters.upcoming]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getEvents({ page, limit: 9, search: debouncedSearch, category: filters.category, upcoming: filters.upcoming })
      .then((res) => {
        if (!active) return;
        setEvents(res.data.data.events);
        setPagination(res.data.pagination);
      })
      .catch((err) => active && setError(err.response?.data?.message || "Failed to load events"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [page, debouncedSearch, filters.category, filters.upcoming]);

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">📅 Village Events</h1>
      <div className="card p-4 flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Search events..." value={filters.search} onChange={set("search")} />
        <select className="input max-w-[180px]" value={filters.category} onChange={set("category")}>
          <option value="">All Categories</option>
          {EVENT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className="input max-w-[160px]" value={filters.upcoming} onChange={set("upcoming")}>
          <option value="true">Upcoming</option>
          <option value="">All Events</option>
        </select>
      </div>
      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => setPage((p) => p)} />
        ) : events.length === 0 ? (
          <EmptyState icon="📅" title="No events found" description="Check back later for upcoming events." />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => <EventCard key={e._id} event={e} />)}
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}