import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getMyFeatureApplications,
  getFeatureApplicationById,
} from "../../services/villageFeatureService";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import BackButton from "../../components/common/BackButton";
import { formatDate } from "../../utils/formatDate";
import { useLanguage } from "../../context/LanguageContext";

const STATUS_META = {
  submitted: { label: "Jama ho gaya", badge: "badge-blue" },
  "under-review": { label: "Jaanch me", badge: "badge-yellow" },
  "documents-required": { label: "Documents chahiye", badge: "badge-red" },
  approved: { label: "Manjoor", badge: "badge-green" },
  completed: { label: "Poora hua", badge: "badge-green" },
  rejected: { label: "Asweekar", badge: "badge-red" },
  cancelled: { label: "Radd", badge: "badge-gray" },
};

const FILTERS = ["all", "submitted", "under-review", "documents-required", "approved", "rejected"];

function ApplicationCard({ app }) {
  const meta = STATUS_META[app.status] || { label: app.status, badge: "badge-gray" };
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {app.featureTitle || app.feature?.title}
          </h3>
          <p className="text-xs text-gray-500 capitalize">{app.category?.replace("-", " ")}</p>
        </div>
        <span className={meta.badge}>{meta.label}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-gray-500">Tracking ID</p>
          <p className="font-mono text-gray-900 dark:text-white break-all">{app.trackingId}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Applied on</p>
          <p className="text-gray-900 dark:text-white">{formatDate(app.createdAt)}</p>
        </div>
      </div>

      {app.statusMessage && (
        <p className="text-sm text-gray-700 dark:text-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900 p-3">
          {app.statusMessage}
        </p>
      )}
      {app.status === "rejected" && app.rejectionReason && (
        <p className="text-sm text-red-700 dark:text-red-300 rounded-lg bg-red-50 dark:bg-red-950/40 p-3">
          Karan: {app.rejectionReason}
        </p>
      )}
      {app.adminRemarks && (
        <p className="text-xs text-gray-500">Panchayat remarks: {app.adminRemarks}</p>
      )}
    </div>
  );
}

export default function MyApplications() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [trackId, setTrackId] = useState("");
  const [tracking, setTracking] = useState(false);
  const [tracked, setTracked] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    const params = status === "all" ? {} : { status };
    getMyFeatureApplications(params)
      .then((res) => setApplications(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => setError(err.message || "Applications load nahi ho paayin"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    setTracking(true);
    setTracked(null);
    try {
      const res = await getFeatureApplicationById(trackId.trim());
      setTracked(res?.data || null);
    } catch (err) {
      toast.error(err.message || "Application nahi mili");
    } finally {
      setTracking(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      <BackButton to="/citizen/dashboard" />

      <div>
        <h1 className="section-title">🌾 {t("citizenApps.title", "Meri Yojana / Seva Applications")}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t(
            "citizenApps.subtitle",
            "Sarkari yojana, scholarship, training aur gaon ki sevaon ke liye diye gaye aapke sabhi aavedan."
          )}
        </p>
      </div>

      <form onSubmit={handleTrack} className="card p-4 flex flex-col sm:flex-row gap-3">
        <input
          className="input"
          placeholder={t("citizenApps.trackPlaceholder", "Tracking ID daalein (jaise KAK-123456-ABC123)")}
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
        />
        <button type="submit" className="btn-primary sm:w-40" disabled={tracking}>
          {tracking ? "Dhundh rahe hain..." : t("citizenApps.track", "Status dekhein")}
        </button>
      </form>

      {tracked && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("citizenApps.trackResult", "Tracking result")}
          </p>
          <ApplicationCard app={tracked} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              status === f
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
            }`}
          >
            {f === "all" ? "Sabhi" : STATUS_META[f]?.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon="🌾"
          title={t("citizenApps.emptyTitle", "Abhi tak koi aavedan nahi")}
          description={t(
            "citizenApps.emptyDesc",
            "Village Services me jaakar kisi yojana ya seva ke liye aavedan karein."
          )}
          action={
            <Link to="/citizen/village-services" className="btn-primary">
              {t("citizenApps.browse", "Village Services dekhein")}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {applications.map((a) => (
            <ApplicationCard key={a._id} app={a} />
          ))}
        </div>
      )}
    </div>
  );
}