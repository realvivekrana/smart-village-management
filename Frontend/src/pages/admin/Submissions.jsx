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
import BackButton from "../../components/common/BackButton";

import { useLanguage } from "../../context/LanguageContext";
import { ZoomImage } from "../../components/common/ImageLightbox";
/*
 * Citizen ki daali hui cheezein (Gaon Bazaar + Gallery photos)
 * yahin se approve / reject hoti hain.
 * (Businesses ka approval "Businesses" page par pehle jaisa hi hai.)
 */

const STATUS_FILTERS = [
  { value: "", key: "st.allNewPosts", label: "All (new posts)" },
  { value: "approved", key: "st.live", label: "Live" },
  { value: "rejected", key: "st.removed", label: "Removed" },
  { value: "pending", key: "st.pendingReview", label: "Pending review" },
];

export default function Submissions() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("bazaar");
  const [status, setStatus] = useState("");
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
      .catch((err) => setError(err.response?.data?.message || t("ui.couldNotLoad3dc", "Could not load")))
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
      toast.success(newStatus === "approved" ? t("ui.approved6f8", "Approved") : t("ui.rejectedd37", "Rejected"));
      setRejectTarget(null);
      setReason("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t("ui.couldNotUpdatee8d", "Could not update"));
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = () => {
    if (!reason.trim()) return toast.error(t("ui.pleaseWriteTheReasonFor2bb", "Please write the reason for rejection"));
    review(rejectTarget, "rejected", reason.trim());
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await (isBazaar ? deleteListing : deletePhoto)(deleteTarget._id);
      toast.success(t("ui.removed93f", "Removed"));
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t("ui.couldNotRemove31e", "Could not remove"));
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
      <div><BackButton to="/admin/dashboard" label="Back to Dashboard" /></div>
      <div>
        <h1 className="section-title">✅ Citizen Approvals</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t("ui.approveBazaarListingsAndGallery05d", "Approve Bazaar listings and Gallery photos posted by villagers here. They become visible to everyone only after approval.")}
        </p>
        <p className="text-xs text-gray-500 mt-1">{t("ui.businessApprovalsAreHandledOnfeb", "Business approvals are handled on the Businesses page.")}</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
        {[
          { value: "bazaar", label: `🛒 ${t("ui.villageBazaarTab", "Village Bazaar")}` },
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
            {t(f.key, f.label)}
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
          title={t("ui.nothingHerec65", "Nothing here")}
          description={status === "pending" ? t("ui.nothingIsWaitingForApproval487", "Nothing is waiting for approval.") : t("ui.nothingFoundForThisFilter7b1", "Nothing found for this filter.")}
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
                <ZoomImage src={p.image?.url} alt={p.caption || t("ui.villagePhoto92d", "Village photo")} className="h-44 w-full object-cover" loading="lazy" />
                <div className="p-3 space-y-2 flex-1 flex flex-col">
                  {rv && <span className={rv.badge}>{t(rv.key, rv.label)}</span>}
                  {p.caption && <p className="text-sm text-gray-800 dark:text-gray-200">{p.caption}</p>}
                  <p className="text-xs text-gray-500">
                    {p.createdBy?.name || "—"}
                    {p.createdBy?.phone ? ` • ${p.createdBy.phone}` : ""} • {formatDate(p.createdAt)}
                  </p>
                  {p.status === "rejected" && p.rejectionReason && (
                    <p className="text-xs text-red-700 dark:text-red-300">{t("bz.reason", "Reason")}: {p.rejectionReason}</p>
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
        title={t("ui.reasonForRejectionb90", "Reason for rejection")}
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
            placeholder={t("ui.eGPhotoIsUnclear202", "e.g. Photo is unclear / Details are incomplete")}
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
        title={t("ui.remove106", "Remove")}
        message={t("ui.doYouReallyWantToffc", "Do you really want to remove this? This cannot be undone.")}
        confirmLabel={t("ui.remove106", "Remove")}
        loading={deleting}
      />
    </div>
  );
}