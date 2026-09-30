import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyNotices, deleteNotice } from "../../services/noticeService";
import { getMyEvents, deleteEvent } from "../../services/eventService";
import BackButton from "../../components/common/BackButton";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";
import { STATUS_BADGE, prettyCategory } from "../../utils/submissionOptions";
import { formatDate } from "../../utils/formatDate";
import { useLanguage } from "../../context/LanguageContext";
import useHighlight from "../../hooks/useHighlight";

const TABS = {
  notices: { fetch: getMyNotices, remove: deleteNotice, listKey: "notices", addTo: "/citizen/notices/new", detail: "/citizen/notices" },
  events: { fetch: getMyEvents, remove: deleteEvent, listKey: "events", addTo: "/citizen/events/new", detail: "/citizen/events" },
};

// old records created before the status field existed have no status: they are live
const statusOf = (item) => item.status || "approved";

export default function MySubmissions() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "events" ? "events" : "notices";
  const cfg = TABS[tab];

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { hlClass } = useHighlight(!loading && !error);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    cfg
      .fetch({ page, limit: 10 })
      .then((res) => {
        setItems(res.data?.data?.[cfg.listKey] || []);
        setPagination(res.data?.pagination || null);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load your submissions"))
      .finally(() => setLoading(false));
  }, [cfg, page]);

  useEffect(load, [load]);

  const switchTab = (next) => {
    setPage(1);
    setParams(next === "events" ? { tab: "events" } : {}, { replace: true });
  };

  const handleDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await cfg.remove(target._id);
      toast.success("Removed");
      setTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove it");
    } finally {
      setDeleting(false);
    }
  };

  const tabBtn = (key, label) => (
    <button
      type="button"
      onClick={() => switchTab(key)}
      className={`min-h-[44px] flex-1 rounded-lg px-4 text-sm font-medium transition-colors sm:flex-none ${
        tab === key
          ? "bg-primary-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="page-container max-w-3xl space-y-4">
      <BackButton fallback="/citizen/dashboard" label={t("submit.back", "Back")} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="section-title">🗒️ {t("submit.mySubmissions", "My Notices & Events")}</h1>
        <Link to={cfg.addTo} className="btn-primary">
          ➕ {tab === "events" ? t("submit.addEvent", "Add Event") : t("submit.addNotice", "Add Notice")}
        </Link>
      </div>

      <div className="flex gap-2">
        {tabBtn("notices", "📢 Notices")}
        {tabBtn("events", "📅 Events")}
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState icon="🗒️" title={t("submit.nothingYet", "You have not submitted anything yet.")} />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const status = statusOf(item);
            return (
              <li key={item._id} data-highlight-id={item._id} className={`card space-y-2 p-4 ${hlClass(item._id)}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="min-w-0 flex-1 font-semibold text-gray-900 dark:text-white">{item.title}</h2>
                  <span className={`badge ${STATUS_BADGE[status]}`}>
                    {t(`submit.${status}`, status)}
                  </span>
                </div>

                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                  {item.content || item.description}
                </p>

                <p className="text-xs text-gray-500">
                  {prettyCategory(item.category)} · {tab === "events" && item.startDate
                    ? formatDate(item.startDate)
                    : `Sent ${formatDate(item.createdAt)}`}
                </p>

                {status === "rejected" && item.rejectionReason && (
                  <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                    <strong>{t("submit.reason", "Reason")}:</strong> {item.rejectionReason}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {status === "approved" && (
                    <Link to={`${cfg.detail}/${item._id}`} className="btn-secondary">View</Link>
                  )}
                  <Link to={`${cfg.detail}/${item._id}/edit`} className="btn-secondary">Edit</Link>
                  <button type="button" className="btn-secondary" onClick={() => setTarget(item)}>
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={!!target}
        onClose={() => setTarget(null)}
        onConfirm={handleDelete}
        title="Remove submission"
        message="This will remove it for everyone. Do you want to continue?"
        confirmLabel="Remove"
        loading={deleting}
      />
    </div>
  );
}