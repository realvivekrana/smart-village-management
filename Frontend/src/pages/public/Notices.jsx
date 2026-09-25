import { useEffect, useState } from "react";
import { getNotices } from "../../services/noticeService";
import { NOTICE_CATEGORIES } from "../../utils/constants";
import NoticeCard from "../../components/notices/NoticeCard";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import useDebounce from "../../hooks/useDebounce";

export default function Notices() {
  const [filters, setFilters] = useState({ search: "", category: "" });
  const [page, setPage] = useState(1);
  const [notices, setNotices] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 400);
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => { setPage(1); }, [debouncedSearch, filters.category]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getNotices({ page, limit: 9, search: debouncedSearch, category: filters.category })
      .then((res) => {
        if (!active) return;
        setNotices(res.data.data.notices);
        setPagination(res.data.pagination);
      })
      .catch((err) => active && setError(err.response?.data?.message || "Failed to load notices"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [page, debouncedSearch, filters.category]);

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">📢 Notices &amp; Announcements</h1>
      <div className="card p-4 flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Search notices..." value={filters.search} onChange={set("search")} />
        <select className="input max-w-[200px]" value={filters.category} onChange={set("category")}>
          <option value="">All Categories</option>
          {NOTICE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => setPage((p) => p)} />
        ) : notices.length === 0 ? (
          <EmptyState icon="📢" title="No notices found" description="Check back later for updates." />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              {notices.map((n) => <NoticeCard key={n._id} notice={n} />)}
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}