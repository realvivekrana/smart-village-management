import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAllListingsAdmin,
  reviewListing,
  deleteListing,
} from "../../services/listingService";
import { getAllPhotosAdmin, reviewPhoto, deletePhoto } from "../../services/galleryService";
import { REVIEW_STATUS } from "../../utils/bazaar";
import { formatDate } from "../../utils/formatDate";
import ListingCard from "../../components/bazaar/ListingCard";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";

/*
 * Citizen ki daali hui cheezein (Gaon Bazaar + Gallery photos)
 * yahin se approve / reject hoti hain.
 * (Businesses ka approval "Businesses" page par pehle jaisa hi hai.)
 */

const STATUS_FILTERS = [
  { value: "pending", label: "Approval baaki" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "Sabhi" },
];

export default function Submissions() {
  const [tab, setTab] = useState("bazaar");
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const isBazaar = tab === "bazaar";

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = { page, limit: 12 };
    if (status) params.status = status;

    const request = isBazaar ? getAllListingsAdmin(params) : getAllPhotosAdmin(params);

    request
      .then((res) => {
        const d = res.data?.data || {};
        setItems(isBazaar ? d.listings || [] : d.photos || []);
        setPagination(res.data?.pagination || null);
      })
      .catch((err) => setError(err.response?.data?.message || "Load nahi ho paya"))
      .finally(() => setLoading(false));
  }, [tab, status, page, isBazaar]);

  useEffect(() => {
    load();
  }, [load]);

  const switchTab = (value) => {
    setTab(value);
    setPage(1);
  };

  const switchStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  const review = async (item, newStatus, rejectionReason = "") => {
    setBusyId(item._id);
    try {
      const fn = isBazaar ? reviewListing : reviewPhoto;
      await fn(item._id, { status: newStatus, rejectionReason });
      toast.success(newStatus === "approved" ? "Approve ho gaya" : "Reject ho gaya");
      setRejectTarget(null);
      setReason("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update nahi ho paya");
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = () => {
    if (!reason.trim()) return toast.error("Reject karne ka karan likhiye");
    review(rejectTarget, "rejected", reason.trim());
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await (isBazaar ? deleteListing : deletePhoto)(deleteTarget._id);
      toast.success("Hata diya gaya");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Hata nahi paya");
    } finally {
      setDeleting(false);
    }
  };

  const renderReviewButtons = (item) => (
    <>
      {item.status !== "approved" && (
        <button className="btn-primary" disabled={busyId === item._id} onClick={() => review(item, "approved")}>
          ✅ Approve
        </button>
      )}
      {item.status !== "rejected" && (
        <button className="btn-secondary" disabled={busyId === item._id} onClick={() => setRejectTarget(item)}>
          ❌ Reject
        </button>
      )}
      <button className="btn-danger" onClick={() => setDeleteTarget(item)}>
        🗑️
      </button>
    </>
  );

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="section-title">✅ Citizen Approvals</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gaon walon ke daale hue Bazaar vigyapan aur Gallery photos yahan se approve karein. Approve hone ke baad hi ye sabko dikhte hain.
        </p>
        <p className="text-xs text-gray-500 mt-1">Dukaanon ka approval &quot;Businesses&quot; page par hota hai.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
        {[
          { value: "bazaar", label: "🛒 Gaon Bazaar" },
          { value: "gallery", label: "📷 Gallery Photos" },
        ].map((tb) => (
          <button
            key={tb.value}
            onClick={() => switchTab(tb.value)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === tb.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            onClick={() => switchStatus(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              status === f.value
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={isBazaar ? "🛒" : "📷"}
          title="Yahan kuchh nahi hai"
          description={status === "pending" ? "Koi bhi cheez approval ke liye baaki nahi hai." : "Is filter me kuchh nahi mila."}
        />
      ) : isBazaar ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <ListingCard key={l._id} listing={l} showStatus showOwner>
              {renderReviewButtons(l)}
            </ListingCard>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => {
            const rv = REVIEW_STATUS[p.status];
            return (
              <div key={p._id} className="card overflow-hidden flex flex-col">
                <img src={p.image?.url} alt={p.caption || "Gaon ki photo"} className="h-44 w-full object-cover" loading="lazy" />
                <div className="p-3 space-y-2 flex-1 flex flex-col">
                  {rv && <span className={rv.badge}>{rv.label}</span>}
                  {p.caption && <p className="text-sm text-gray-800 dark:text-gray-200">{p.caption}</p>}
                  <p className="text-xs text-gray-500">
                    {p.createdBy?.name || "—"}
                    {p.createdBy?.phone ? ` • ${p.createdBy.phone}` : ""} • {formatDate(p.createdAt)}
                  </p>
                  {p.status === "rejected" && p.rejectionReason && (
                    <p className="text-xs text-red-700 dark:text-red-300">Karan: {p.rejectionReason}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-auto pt-1">
                    {renderReviewButtons(p)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal
        isOpen={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          setReason("");
        }}
        title="Reject karne ka karan"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Ye karan citizen ko notification me dikhega.
          </p>
          <textarea
            className="input"
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Jaise: Photo saaf nahi hai / Jaankari adhuri hai"
          />
          <div className="flex justify-end gap-2">
            <button
              className="btn-secondary"
              onClick={() => {
                setRejectTarget(null);
                setReason("");
              }}
            >
              Wapas
            </button>
            <button className="btn-danger" disabled={busyId === rejectTarget?._id} onClick={confirmReject}>
              Reject karein
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hatayein"
        message="Kya aap sach me ise hatana chahte hain? Ye wapas nahi aayega."
        confirmLabel="Hatayein"
        loading={deleting}
      />
    </div>
  );
}