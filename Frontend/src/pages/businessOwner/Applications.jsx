import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getJobById, getJobApplications, updateApplicationStatus } from "../../services/jobService";
import { formatDate, formatRelative } from "../../utils/formatDate";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";

const STATUS_OPTIONS = ["pending", "reviewed", "shortlisted", "rejected", "hired"];

const STATUS_BADGE = {
  pending: "badge-yellow",
  reviewed: "badge-blue",
  shortlisted: "badge-blue",
  hired: "badge-green",
  rejected: "badge-red",
};

export default function Applications() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    getJobById(jobId)
      .then((res) => setJob(res.data.data.job))
      .catch(() => {});
  }, [jobId]);

  const load = () => {
    setLoading(true);
    setError(null);
    getJobApplications(jobId, { page, limit: 10, status: statusFilter || undefined })
      .then((res) => {
        setApplications(res.data.data.applications);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load applications"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [jobId, page, statusFilter]);

  const handleStatusChange = async (application, status) => {
    setUpdatingId(application._id);
    try {
      await updateApplicationStatus(application._id, { status });
      toast.success("Application status updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page-container space-y-6">
      <div>
        <Link to="/business-owner/my-jobs" className="text-sm text-primary-600 hover:underline">← My Jobs</Link>
        <h1 className="section-title mt-2">📥 Applications{job ? ` — ${job.title}` : ""}</h1>
        {job && <p className="text-gray-500 dark:text-gray-400 mt-1">{job.company} · {job.location}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setStatusFilter(""); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-sm border ${!statusFilter ? "bg-primary-600 text-white border-primary-600" : "border-gray-200 dark:border-gray-600"}`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm border capitalize ${statusFilter === s ? "bg-primary-600 text-white border-primary-600" : "border-gray-200 dark:border-gray-600"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : applications.length === 0 ? (
        <EmptyState icon="📥" title="No applications yet" description="Applications from citizens will appear here." />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="card p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{app.applicant?.name}</h3>
                  <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                  {app.applicant?.phone && <p className="text-sm text-gray-500">📞 {app.applicant.phone}</p>}
                </div>
                <span className={`badge ${STATUS_BADGE[app.status] || "badge-gray"} capitalize`}>{app.status}</span>
              </div>

              {app.coverLetter && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 whitespace-pre-line">{app.coverLetter}</p>
              )}

              <div className="flex items-center justify-between flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Applied {formatRelative(app.createdAt)} · {formatDate(app.createdAt)}</span>
                  {app.resume?.url && (
                    <a href={app.resume.url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline font-medium">
                      📄 View Resume
                    </a>
                  )}
                </div>
                <select
                  className="input text-sm py-1.5 w-auto"
                  value={app.status}
                  disabled={updatingId === app._id}
                  onChange={(e) => handleStatusChange(app, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
}