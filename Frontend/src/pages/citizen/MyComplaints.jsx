import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getComplaints, deleteComplaint } from "../../services/complaintService";
import ComplaintCard from "../../components/complaints/ComplaintCard";
import ComplaintTimeline from "../../components/complaints/ComplaintTimeline";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { COMPLAINT_STATUSES } from "../../utils/constants";
import BackButton from "../../components/common/BackButton";

export default function MyComplaints() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { setPage(1); }, [status]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getComplaints({ page, limit: 8, status })
      .then((res) => {
        if (!active) return;
        setComplaints(res.data.data.complaints);
        setPagination(res.data.pagination);
      })
      .catch((err) => active && setError(err.response?.data?.message || "Failed to load complaints"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [page, status]);

  const handleDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await deleteComplaint(confirmTarget._id);
      toast.success("Complaint deleted");
      setConfirmTarget(null);
      setComplaints((prev) => prev.filter((c) => c._id !== confirmTarget._id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete complaint");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="mb-4"><BackButton to="/citizen/dashboard" label="Back to Dashboard" /></div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="section-title">📋 My Complaints</h1>
        <Link to="/citizen/complaints/create" className="btn-primary">➕ File a Complaint</Link>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 mb-6">
        <select className="input max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.values(COMPLAINT_STATUSES).map((s) => (
            <option key={s} value={s} className="capitalize">{s.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => setPage((p) => p)} />
      ) : complaints.length === 0 ? (
        <EmptyState icon="📋" title="No complaints found" description="You haven't filed any complaints yet." />
      ) : (
        <>
          <div className="space-y-4">
            {complaints.map((c) => (
              <div key={c._id}>
                <button
                  onClick={() => setExpandedId(expandedId === c._id ? null : c._id)}
                  className="w-full text-left"
                >
                  <ComplaintCard complaint={c} />
                </button>
                {expandedId === c._id && <div className="mt-2"><ComplaintTimeline timeline={c.timeline} /></div>}
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmTarget(c)}
                    className="btn-danger text-xs px-3 py-1.5"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDelete}
        title="Delete Complaint"
        message="Are you sure you want to delete this complaint? This is permanent, even if it is already in progress or resolved."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}