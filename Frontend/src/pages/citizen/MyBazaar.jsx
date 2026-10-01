import { useEffect, useState } from "react";
import useHighlight from "../../hooks/useHighlight";
import toast from "react-hot-toast";
import {
  getMyListings,
  createListing,
  updateListing,
  toggleListingClosed,
  deleteListing,
} from "../../services/listingService";
import { LISTING_TYPES, RENTAL_UNITS, getTypeMeta } from "../../utils/bazaar";
import useAuth from "../../hooks/useAuth";
import { useLanguage } from "../../context/LanguageContext";
import ListingCard from "../../components/bazaar/ListingCard";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import BackButton from "../../components/common/BackButton";

const MAX_IMAGES = 3;
const MAX_SIZE = 5 * 1024 * 1024;

function ListingForm({ initial, onSubmit, onCancel, submitting }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const editing = !!initial;

  const [form, setForm] = useState({
    type: initial?.type || "buy-sell",
    title: initial?.title || "",
    description: initial?.description || "",
    itemStatus: initial?.itemStatus === "found" ? "found" : "lost",
    price: initial?.price ?? "",
    priceUnit: initial?.priceUnit && initial.priceUnit !== "fixed" ? initial.priceUnit : "day",
    location: initial?.location || "",
    contactName: initial?.contactName || user?.name || "",
    contactPhone: initial?.contactPhone || user?.phone || "",
  });
  const [files, setFiles] = useState([]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length > MAX_IMAGES) {
      toast.error(t("ui.atMostPhotos", "At most {max} photos", { max: MAX_IMAGES }));
    }
    const valid = picked.slice(0, MAX_IMAGES).filter((f) => {
      if (f.size > MAX_SIZE) {
        toast.error(t("ui.fileTooBig", "{name} is larger than 5 MB", { name: f.name }));
        return false;
      }
      return true;
    });
    setFiles(valid);
  };

  const submit = (e) => {
    e.preventDefault();
    if (form.title.trim().length < 3) return toast.error(t("ui.titleMustBeAtLeast6cf", "Title must be at least 3 characters"));
    if (!/^[0-9+\-\s]{10,15}$/.test(form.contactPhone.trim())) {
      return toast.error(t("ui.enterAValidPhoneNumber011", "Enter a valid phone number"));
    }

    if (editing) {
      const { type, ...rest } = form;
      onSubmit(rest);
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null) fd.append(k, v);
    });
    files.forEach((f) => fd.append("images", f));
    onSubmit(fd);
  };

  const isLost = form.type === "lost-found";
  const isRental = form.type === "equipment-rental";

  return (
    <form onSubmit={submit} className="space-y-4">
      {!editing && (
        <div className="form-group">
          <label className="label">{t("ui.whatKindOfListing296", "What kind of listing?")}</label>
          <div className="grid grid-cols-3 gap-2">
            {LISTING_TYPES.map((tp) => (
              <button
                type="button"
                key={tp.value}
                onClick={() => setForm((f) => ({ ...f, type: tp.value }))}
                className={`rounded-xl border p-3 text-center text-sm font-medium transition-colors ${
                  form.type === tp.value
                    ? "border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                <div className="text-2xl">{tp.icon}</div>
                {t(tp.key, tp.label)}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLost && (
        <div className="form-group">
          <label className="label">{t("ui.whatHappenedfa6", "What happened?")}</label>
          <select className="input" value={form.itemStatus} onChange={set("itemStatus")}>
            <option value="lost">{t("ui.iLostSomething104", "I lost something")}</option>
            <option value="found">{t("ui.iFoundSomethingd46", "I found something")}</option>
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="label">Title *</label>
        <input className="input" value={form.title} onChange={set("title")} maxLength={120} required />
      </div>

      <div className="form-group">
        <label className="label">{t("ui.details3ec", "Details")}</label>
        <textarea
          className="input"
          rows={3}
          value={form.description}
          onChange={set("description")}
          maxLength={1500}
        />
      </div>

      {!isLost && (
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="label">{t("ui.price6e2", "Price (₹)")}</label>
            <input className="input" type="number" min="0" value={form.price} onChange={set("price")} />
          </div>
          {isRental && (
            <div className="form-group">
              <label className="label">{t("ui.rentChargedPer93c", "Rent charged per")}</label>
              <select className="input" value={form.priceUnit} onChange={set("priceUnit")}>
                {RENTAL_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {t(u.key, u.label)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="form-group">
        <label className="label">{t("ui.placeLocality2a2", "Place / Locality")}</label>
        <input className="input" value={form.location} onChange={set("location")} maxLength={200} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="form-group">
          <label className="label">{t("ui.name49e", "Name")}</label>
          <input className="input" value={form.contactName} onChange={set("contactName")} />
        </div>
        <div className="form-group">
          <label className="label">Phone *</label>
          <input className="input" value={form.contactPhone} onChange={set("contactPhone")} required />
        </div>
      </div>
      <p className="text-xs text-gray-500 -mt-2">
        Ye phone number sabko dikhega.
      </p>

      {!editing && (
        <div className="form-group">
          <label className="label">Photo (max {MAX_IMAGES})</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFiles}
            className="block w-full text-sm text-gray-600 dark:text-gray-300"
          />
          {files.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{files.length} photo chuni gayi</p>
          )}
        </div>
      )}

      <p className="text-xs text-amber-700 dark:text-amber-300 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
        {t("ui.thisListingWillBeVisiblec7c", "This listing will be visible to everyone only after admin approval.")}
        {editing && " " + t("ui.changesNeedApprovalAgain", "Changes will need approval again.")}
      </p>

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {t("ui.cancelea4", "Cancel")}
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? t("ui.sending7b0", "Sending...") : editing ? t("ui.savec9c", "Save") : t("ui.post03d", "Post")}
        </button>
      </div>
    </form>
  );
}

export default function MyBazaar() {
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { hlClass } = useHighlight(!loading && !error);

  const load = () => {
    setLoading(true);
    setError(null);
    getMyListings({ limit: 50 })
      .then((res) => setListings(res.data?.data?.listings || []))
      .catch((err) => setError(err.response?.data?.message || t("ui.couldNotLoadListings16a", "Could not load listings")))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (l) => {
    setEditTarget(l);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      const res = editTarget
        ? await updateListing(editTarget._id, payload)
        : await createListing(payload);
      toast.success(res.data?.message || t("ui.donef92", "Done"));
      setFormOpen(false);
      setEditTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t("ui.couldNotSaveTheListingfde", "Could not save the listing"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (l) => {
    try {
      const res = await toggleListingClosed(l._id);
      const updated = res.data?.data?.listing;
      setListings((prev) => prev.map((x) => (x._id === l._id ? { ...x, isClosed: updated.isClosed } : x)));
    } catch (err) {
      toast.error(err.response?.data?.message || t("ui.couldNotMakeTheChange26b", "Could not make the change"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteListing(deleteTarget._id);
      toast.success(t("ui.listingRemovedc90", "Listing removed"));
      setListings((prev) => prev.filter((x) => x._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || t("ui.couldNotRemoveTheListingb7a", "Could not remove the listing"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      <BackButton to="/citizen/dashboard" />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="section-title">🛒 {t("myBazaar.title", "My Bazaar Listings")}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t(
              "myBazaar.subtitle",
              t("ui.sellItemsReportLostFound04a", "Sell items, report lost & found, or rent out farm equipment. It will be visible to everyone after admin approval.")
            )}
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          ➕ {t("ui.newListing407", "New listing")}
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : listings.length === 0 ? (
        <EmptyState
          icon="🛒"
          title={t("ui.youHaventPostedAnyListingd92", "You haven't posted any listing yet")}
          description={t("ui.postYourFirstListingTo3ed", "Post your first listing to sell, report lost & found, or rent.")}
          action={
            <button className="btn-primary" onClick={openCreate}>
              ➕ {t("ui.newListing407", "New listing")}
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <div key={l._id} data-highlight-id={l._id} className={hlClass(l._id)}>
            <ListingCard listing={l} showStatus>
              <button className="btn-secondary" onClick={() => openEdit(l)}>
                ✏️ Badlein
              </button>
              {l.status === "approved" && (
                <button className="btn-outline" onClick={() => handleToggle(l)}>
                  {l.isClosed ? t("ui.reopenb82", "Reopen") : t(getTypeMeta(l.type).closedKey, getTypeMeta(l.type).closedLabel)}
                </button>
              )}
              <button className="btn-danger" onClick={() => setDeleteTarget(l)}>
                🗑️
              </button>
            </ListingCard>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editTarget ? t("ui.editListingf26", "Edit listing") : t("ui.newListing407", "New listing")}
        size="lg"
      >
        <ListingForm
          key={editTarget?._id || "new"}
          initial={editTarget}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("ui.removeListing102", "Remove listing")}
        message={t("ui.doYouReallyWantTob01", "Do you really want to remove this listing?")}
        confirmLabel={t("ui.remove106", "Remove")}
        loading={deleting}
      />
    </div>
  );
}