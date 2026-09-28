import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getCertificates, updateCertificateStatus, deleteCertificate } from "../../services/certificateService";
import CertificateCard from "../../components/certificates/CertificateCard";
import CertificateTimeline from "../../components/certificates/CertificateTimeline";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { CERTIFICATE_STATUSES, CERTIFICATE_TYPES } from "../../utils/constants";

export default function CertificateRequests() {
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => { setPage(1); }, [status, type, search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getCertificates({ page, limit: 10, status, type, search })
      .then((res) => {
        if (!active) return;
        setItems(res.data.data.certificates);
        setPagination(res.data.pagination);
      })
      .catch((err) => active && setError(err.response?.data?.message || "Failed to load requests"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [page, status, type, search, reload]);

  const changeStatus = async (c, newStatus) => {
    const note = window.prompt(`Note for "${newStatus.replace("_", " ")}" (optional):`, "");
    if (note === null) return;
    setBusyId(c._id);
    try {
      await updateCertificateStatus(c._id, { status: newStatus, note, adminNote: note });
      toast.success("Status updated");
      setReload((n) => n + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget._id);
    try {
      await deleteCertificate(deleteTarget._id);
      toast.success("Request deleted");
      setDeleteTarget(null);
      setReload((n) => n + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="section-title">📜 Certificate Requests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Villagers ki certificate requests review karein.</p>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <input className="input max-w-[220px]" placeholder="Search name / request no." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {CERTIFICATE_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s.replace("_", " ")}</option>)}
        </select>
        <select className="input max-w-[220px]" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          {CERTIFICATE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label.split(" (")[0]}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => setReload((n) => n + 1)} />
      ) : items.length === 0 ? (
        <EmptyState icon="📜" title="No requests found" />
      ) : (
        <>
          <div className="space-y-4">
            {items.map((c) => (
              <div key={c._id}>
                <CertificateCard
                  certificate={c}
                  actions={
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-gray-500">by {c.submittedBy?.name || "—"}</span>
                      <button type="button" className="btn-secondary text-xs px-3 py-1.5"
                        onClick={() => setExpandedId(expandedId === c._id ? null : c._id)}>Details</button>
                      {c.status !== "cancelled" && (
                        <>
                          {c.status !== "in_progress" && <button type="button" disabled={busyId === c._id} className="btn-outline text-xs px-3 py-1.5" onClick={() => changeStatus(c, "in_progress")}>In progress</button>}
                          {c.status !== "approved" && <button type="button" disabled={busyId === c._id} className="btn-primary text-xs px-3 py-1.5" onClick={() => changeStatus(c, "approved")}>Approve</button>}
                          {c.status !== "rejected" && <button type="button" disabled={busyId === c._id} className="btn-danger text-xs px-3 py-1.5" onClick={() => changeStatus(c, "rejected")}>Reject</button>}
                        </>
                      )}
                      <button type="button" className="btn-danger text-xs px-3 py-1.5" onClick={() => setDeleteTarget(c)}>🗑️</button>
                    </div>
                  }
                />
                {expandedId === c._id && (
                  <div className="mt-2 space-y-2">
                    <div className="card p-4 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <p><span className="font-medium">Address:</span> {c.address}</p>
                      <p><span className="font-medium">Contact:</span> {c.submittedBy?.phone || c.submittedBy?.email || "—"}</p>
                      {c.documents?.length > 0 && (
                        <p className="flex flex-wrap gap-2">
                          <span className="font-medium">Documents:</span>
                          {c.documents.map((d, i) => (
                            <a key={i} href={d.url} target="_blank" rel="noreferrer" className="text-primary-600 underline">Doc {i + 1}</a>
                          ))}
                        </p>
                      )}
                    </div>
                    <CertificateTimeline timeline={c.timeline} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Request"
        message="Ye request permanently delete ho jayegi."
        confirmLabel="Delete"
        loading={!!busyId}
      />
    </div>
  );
}