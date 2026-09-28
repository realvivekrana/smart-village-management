import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getCertificates, cancelCertificate, deleteCertificate } from "../../services/certificateService";
import CertificateCard from "../../components/certificates/CertificateCard";
import CertificateTimeline from "../../components/certificates/CertificateTimeline";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { CERTIFICATE_STATUSES } from "../../utils/constants";

export default function MyCertificates() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { item, action }
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => { setPage(1); }, [status]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getCertificates({ page, limit: 8, status })
      .then((res) => {
        if (!active) return;
        setItems(res.data.data.certificates);
        setPagination(res.data.pagination);
      })
      .catch((err) => active && setError(err.response?.data?.message || "Failed to load requests"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [page, status, reload]);

  const runAction = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.action === "cancel") {
        await cancelCertificate(confirm.item._id);
        toast.success("Request cancelled");
      } else {
        await deleteCertificate(confirm.item._id);
        toast.success("Request deleted");
      }
      setConfirm(null);
      setReload((n) => n + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="section-title">📜 My Certificates</h1>
        <Link to="/citizen/certificates/request" className="btn-primary">➕ Request Certificate</Link>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 mb-6">
        <select className="input max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {CERTIFICATE_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s.replace("_", " ")}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => setReload((n) => n + 1)} />
      ) : items.length === 0 ? (
        <EmptyState icon="📜" title="No certificate requests" description="Apne certificate ke liye pehli request yahan se karein." />
      ) : (
        <>
          <div className="space-y-4">
            {items.map((c) => (
              <div key={c._id}>
                <CertificateCard
                  certificate={c}
                  actions={
                    <div className="flex gap-2">
                      <button type="button" className="btn-secondary text-xs px-3 py-1.5"
                        onClick={() => setExpandedId(expandedId === c._id ? null : c._id)}>
                        {expandedId === c._id ? "Hide progress" : "Track"}
                      </button>
                      {c.status === "pending" && (
                        <button type="button" className="btn-danger text-xs px-3 py-1.5"
                          onClick={() => setConfirm({ item: c, action: "cancel" })}>Cancel</button>
                      )}
                      {["cancelled", "rejected"].includes(c.status) && (
                        <button type="button" className="btn-danger text-xs px-3 py-1.5"
                          onClick={() => setConfirm({ item: c, action: "delete" })}>🗑️ Delete</button>
                      )}
                    </div>
                  }
                />
                {expandedId === c._id && <div className="mt-2"><CertificateTimeline timeline={c.timeline} /></div>}
              </div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={runAction}
        title={confirm?.action === "cancel" ? "Cancel Request" : "Delete Request"}
        message={confirm?.action === "cancel"
          ? "Kya aap ye request cancel karna chahte hain? Ye sirf pending request par ho sakta hai."
          : "Kya aap ye request permanently delete karna chahte hain?"}
        confirmLabel={confirm?.action === "cancel" ? "Cancel Request" : "Delete"}
        loading={busy}
      />
    </div>
  );
}