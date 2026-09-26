import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyJobs, createJob, updateJob, deleteJob } from "../../services/jobService";
import { formatDate, isExpired } from "../../utils/formatDate";
import { formatSalaryRange } from "../../utils/formatCurrency";
import JobForm from "../../components/jobs/JobForm";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(null); // { job: null | job }
  const [saving, setSaving] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getMyJobs({ page, limit: 10 })
      .then((res) => {
        setJobs(res.data.data.jobs);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load your job posts"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (modal.job) {
        await updateJob(modal.job._id, payload);
        toast.success("Job updated");
      } else {
        await createJob(payload);
        toast.success("Job posted");
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save job");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await deleteJob(confirmTarget._id);
      toast.success("Job removed");
      setConfirmTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove job");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">💼 My Job Posts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Post openings and review applications from citizens.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setModal({ job: null })}>
          ➕ Post New Job
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="💼"
          title="No job posts yet"
          description="Post your first opening to start receiving applications."
          action={<button type="button" className="btn-primary" onClick={() => setModal({ job: null })}>Post a Job</button>}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const expired = isExpired(job.applyBy);
            return (
              <div key={job._id} className="card p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400">{job.company}</p>
                  </div>
                  {expired ? (
                    <span className="badge badge-gray shrink-0">Closed</span>
                  ) : (
                    <span className="badge badge-green shrink-0">Open</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  <span className="badge badge-blue capitalize">{job.category}</span>
                  <span className="badge badge-gray capitalize">{job.type?.replace("_", " ")}</span>
                  <span className="text-gray-500">📍 {job.location}</span>
                  <span className="text-gray-500">💰 {formatSalaryRange(job.salary)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>🗓 Apply by {formatDate(job.applyBy)}</span>
                  <span>📥 {job.applicationCount || 0} application(s)</span>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Link to={`/business-owner/applications/${job._id}`} className="btn-outline text-xs px-3 py-1.5">
                    View Applications
                  </Link>
                  <button type="button" className="btn-secondary text-xs px-3 py-1.5" onClick={() => setModal({ job })}>
                    Edit
                  </button>
                  <button type="button" className="btn-danger text-xs px-3 py-1.5" onClick={() => setConfirmTarget(job)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.job ? "Edit Job" : "Post New Job"}
        size="lg"
      >
        {modal && <JobForm initial={modal.job || {}} onSubmit={handleSave} loading={saving} />}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDelete}
        title="Remove Job Post"
        message={`Are you sure you want to remove "${confirmTarget?.title}"?`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}