import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyApplications, withdrawApplication } from "../../services/jobService";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import BackButton from "../../components/common/BackButton";
import { formatDate } from "../../utils/formatDate";
import { useLanguage } from "../../context/LanguageContext";

const STATUS_BADGE = {
  pending: "badge-yellow",
  reviewed: "badge-blue",
  shortlisted: "badge-green",
  hired: "badge-green",
  rejected: "badge-red",
};

const STATUS_LABEL = {
  pending: "Intezaar me",
  reviewed: "Dekh li gayi",
  shortlisted: "Shortlist hue",
  hired: "Chayan hua",
  rejected: "Asweekar",
};

export default function MyJobApplications() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [target, setTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getMyApplications()
      .then((res) => setApplications(res.data?.data?.applications || []))
      .catch((err) => setError(err.response?.data?.message || "Applications load nahi ho paayin"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleWithdraw = async () => {
    if (!target) return;
    setWithdrawing(true);
    try {
      await withdrawApplication(target._id);
      toast.success("Application wapas le li gayi");
      setApplications((prev) => prev.filter((a) => a._id !== target._id));
      setTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Application wapas nahi li ja saki");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      <BackButton to="/citizen/dashboard" />

      <div>
        <h1 className="section-title">💼 {t("citizenJobApps.title", "Meri Rozgar Applications")}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t("citizenJobApps.subtitle", "Gaon aur aas-paas ki naukriyon ke liye aapke diye gaye aavedan.")}
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon="💼"
          title={t("citizenJobApps.emptyTitle", "Abhi tak kisi naukri ke liye aavedan nahi")}
          description={t("citizenJobApps.emptyDesc", "Rozgar page par jaakar apne layak kaam dhundhein.")}
          action={
            <Link to="/jobs" className="btn-primary">
              {t("citizenJobApps.browse", "Naukriyan dekhein")}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {applications.map((a) => (
            <div key={a._id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {a.job?.title || "Job removed"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {[a.job?.company, a.job?.location].filter(Boolean).join(" • ")}
                  </p>
                </div>
                <span className={STATUS_BADGE[a.status] || "badge-gray"}>
                  {STATUS_LABEL[a.status] || a.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Applied on {formatDate(a.createdAt)}
                {a.job?.applyBy ? ` • Last date ${formatDate(a.job.applyBy)}` : ""}
              </p>

              {a.adminNote && (
                <p className="text-sm text-gray-700 dark:text-gray-300 rounded-lg bg-gray-50 dark:bg-gray-900 p-3">
                  {a.adminNote}
                </p>
              )}

              <div className="flex gap-2">
                {a.job?._id && (
                  <Link to={`/jobs/${a.job._id}`} className="btn-secondary">
                    Job dekhein
                  </Link>
                )}
                {a.status === "pending" && (
                  <button className="btn-danger" onClick={() => setTarget(a)}>
                    Wapas lein
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!target}
        onClose={() => setTarget(null)}
        onConfirm={handleWithdraw}
        title="Application wapas lein"
        message="Kya aap sach me is job application ko wapas lena chahte hain?"
        confirmLabel="Wapas lein"
        loading={withdrawing}
      />
    </div>
  );
}