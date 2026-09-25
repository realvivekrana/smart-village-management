import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getBusinessById, getBusinessReviews, createReview } from "../../services/businessService";
import BusinessDetailsView from "../../components/business/BusinessDetails";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import useAuth from "../../hooks/useAuth";
import { formatRelative } from "../../utils/formatDate";

export default function BusinessDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bRes, rRes] = await Promise.all([
        getBusinessById(id),
        getBusinessReviews(id, { page: 1, limit: 20 }),
      ]);
      setBusiness(bRes.data.data.business);
      setReviews(rRes.data.data.reviews);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load business");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createReview(id, { rating: Number(rating), comment });
      toast.success("Review submitted!");
      setComment("");
      setRating(5);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;
  if (!business) return null;

  return (
    <div className="page-container max-w-4xl">
      <BusinessDetailsView business={business} />

      <div className="card p-6 mt-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Reviews ({reviews.length})</h2>

        {user && (
          <form onSubmit={handleReviewSubmit} className="mb-6 space-y-3 border-b border-gray-100 dark:border-gray-700 pb-6">
            <div>
              <label className="label">Your Rating</label>
              <select className="input max-w-[120px]" value={rating} onChange={(e) => setRating(e.target.value)}>
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} ★</option>)}
              </select>
            </div>
            <div>
              <label className="label">Your Review</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <Button type="submit" loading={submitting}>Submit Review</Button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-gray-50 dark:border-gray-700 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{r.reviewer?.name || "User"}</span>
                  <span className="text-yellow-400 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-1">{formatRelative(r.createdAt)}</p>
                {r.ownerResponse?.content && (
                  <div className="mt-2 ml-4 p-2 bg-gray-50 dark:bg-gray-700/40 rounded-lg text-xs">
                    <span className="font-medium">Owner response: </span>{r.ownerResponse.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}