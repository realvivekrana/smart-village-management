import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyBusiness, deleteBusiness } from "../../services/businessService";
import { STATUS_COLORS } from "../../utils/constants";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";

function Stars({ avg }) {
  return (
    <span className="text-yellow-400 text-sm">
      {"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}
      <span className="text-gray-500 text-xs ml-1">{avg?.toFixed(1) || "0.0"}</span>
    </span>
  );
}

export default function MyBusiness() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getMyBusiness()
      .then((res) => setBusinesses(res.data.data.businesses))
      .catch((err) => setError(err.response?.data?.message || "Failed to load your businesses"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await deleteBusiness(confirmTarget._id);
      toast.success("Business removed");
      setConfirmTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove business");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">🏪 My Businesses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage the businesses you've registered.</p>
        </div>
        <Link to="/business-owner/add-business" className="btn-primary">➕ Register Business</Link>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : businesses.length === 0 ? (
        <EmptyState
          icon="🏪"
          title="No businesses yet"
          description="Register your first business to get discovered by villagers."
          action={<Link to="/business-owner/add-business" className="btn-primary">Register Business</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b) => {
            const mainImage = b.images?.find((i) => i.isMain) || b.images?.[0];
            return (
              <div key={b._id} className="card overflow-hidden">
                {mainImage?.url ? (
                  <img src={mainImage.url} alt={b.name} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center text-4xl">🏪</div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{b.name}</h3>
                    <span className={`${STATUS_COLORS[b.status]} shrink-0 capitalize`}>{b.status}</span>
                  </div>
                  <span className="badge badge-blue capitalize text-xs inline-block">{b.category}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{b.description}</p>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <Stars avg={b.rating?.average || 0} />
                    <span className="text-gray-400">({b.rating?.count || 0} reviews)</span>
                  </div>
                  {b.status === "rejected" && b.rejectionReason && (
                    <p className="text-xs text-red-600 dark:text-red-400">Reason: {b.rejectionReason}</p>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                    <Link to={`/businesses/${b._id}`} className="btn-outline text-xs px-3 py-1.5 flex-1 text-center">View</Link>
                    <Link to={`/business-owner/edit-business/${b._id}`} className="btn-secondary text-xs px-3 py-1.5 flex-1 text-center">Edit</Link>
                    <button
                      type="button"
                      onClick={() => setConfirmTarget(b)}
                      className="btn-danger text-xs px-3 py-1.5 flex-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDelete}
        title="Remove Business"
        message={`Are you sure you want to remove "${confirmTarget?.name}"? This will hide it from citizens.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}