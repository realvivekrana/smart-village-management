import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyPhotos, uploadPhotos, deletePhoto } from "../../services/galleryService";
import { GALLERY_CATEGORIES, REVIEW_STATUS } from "../../utils/bazaar";
import { formatDate } from "../../utils/formatDate";
import { useLanguage } from "../../context/LanguageContext";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import BackButton from "../../components/common/BackButton";

const MAX_IMAGES = 5;
const MAX_SIZE = 5 * 1024 * 1024;

export default function MyPhotos() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("village");
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getMyPhotos({ limit: 60 })
      .then((res) => setPhotos(res.data?.data?.photos || []))
      .catch((err) => setError(err.response?.data?.message || "Photos load nahi ho paayin"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length > MAX_IMAGES) toast.error(`Ek baar me zyada se zyada ${MAX_IMAGES} photo`);
    const valid = picked.slice(0, MAX_IMAGES).filter((f) => {
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name} 5MB se badi hai`);
        return false;
      }
      return true;
    });
    setFiles(valid);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return toast.error("Pehle photo chuniye");

    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    fd.append("caption", caption);
    fd.append("category", category);

    setUploading(true);
    try {
      const res = await uploadPhotos(fd);
      toast.success(res.data?.message || "Photo bhej di gayi");
      setFiles([]);
      setCaption("");
      setInputKey((k) => k + 1);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Photo upload nahi ho payi");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePhoto(deleteTarget._id);
      toast.success("Photo hata di gayi");
      setPhotos((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Photo hata nahi payi");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      <BackButton to="/citizen/dashboard" />

      <div>
        <h1 className="section-title">📷 {t("myPhotos.title", "Meri Gallery Photos")}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t(
            "myPhotos.subtitle",
            "Gaon ki photo daalein. Admin ki manjoori ke baad ye sabko Gallery me dikhengi."
          )}
        </p>
      </div>

      <form onSubmit={handleUpload} className="card p-5 space-y-4">
        <div className="form-group">
          <label className="label">Photo chuniye (max {MAX_IMAGES}, har ek 5MB tak)</label>
          <input
            key={inputKey}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFiles}
            className="block w-full text-sm text-gray-600 dark:text-gray-300"
          />
          {files.length > 0 && <p className="text-xs text-gray-500 mt-1">{files.length} photo chuni gayi</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="form-group">
            <label className="label">Caption (optional)</label>
            <input
              className="input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={200}
              placeholder="Jaise: Holi ka mela"
            />
          </div>
          <div className="form-group">
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={uploading}>
          {uploading ? "Bhej rahe hain..." : "📤 Approval ke liye bhejein"}
        </button>
      </form>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : photos.length === 0 ? (
        <EmptyState icon="📷" title="Aapne abhi koi photo nahi daali" description="Upar se pehli photo bhejein." />
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => {
            const review = REVIEW_STATUS[p.status];
            return (
              <div key={p._id} className="card overflow-hidden">
                <img src={p.image?.url} alt={p.caption || "Gaon ki photo"} className="h-40 w-full object-cover" loading="lazy" />
                <div className="p-3 space-y-2">
                  {review && <span className={review.badge}>{review.label}</span>}
                  {p.caption && <p className="text-sm text-gray-800 dark:text-gray-200">{p.caption}</p>}
                  <p className="text-xs text-gray-500">{formatDate(p.createdAt)}</p>
                  {p.status === "rejected" && p.rejectionReason && (
                    <p className="text-xs text-red-700 dark:text-red-300">Karan: {p.rejectionReason}</p>
                  )}
                  <button className="btn-danger w-full" onClick={() => setDeleteTarget(p)}>
                    🗑️ Hatayein
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Photo hatayein"
        message="Kya aap sach me ye photo hatana chahte hain?"
        confirmLabel="Hatayein"
        loading={deleting}
      />
    </div>
  );
}