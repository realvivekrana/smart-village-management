import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBusinessOwnerDashboard } from "../../services/dashboardService";
import { STATUS_COLORS } from "../../utils/constants";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import useAuth from "../../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getBusinessOwnerDashboard()
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="page-container"><ErrorMessage message={error} onRetry={load} /></div>;
  if (!stats) return null;

  return (
    <div className="page-container space-y-8">
      <div>
        <h1 className="section-title">👋 Welcome, {user?.name}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's an overview of your business and job postings.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-1">Total Businesses</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.businesses.total}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-1">Approved Businesses</p>
          <p className="text-2xl font-bold text-green-600">{stats.businesses.approved}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-1">Active Job Posts</p>
          <p className="text-2xl font-bold text-primary-600">{stats.jobs.active}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.jobs.total} total posted</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-1">Pending Applications</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.applications.pending}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.applications.total} total received</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/business-owner/add-business" className="btn-primary">➕ Register a Business</Link>
        <Link to="/business-owner/my-jobs" className="btn-secondary">💼 Manage Job Posts</Link>
        <Link to="/business-owner/my-business" className="btn-secondary">🏪 My Businesses</Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Businesses</h2>
        {stats.businesses.list.length === 0 ? (
          <EmptyState
            icon="🏪"
            title="No businesses yet"
            description="Register your first business to get discovered by villagers."
            action={<Link to="/business-owner/add-business" className="btn-primary">Register Business</Link>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.businesses.list.map((b) => (
              <div key={b._id} className="card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{b.name}</h3>
                  <span className={`${STATUS_COLORS[b.status]} shrink-0 capitalize`}>{b.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>⭐ {b.rating?.average?.toFixed(1) || "0.0"} ({b.rating?.count || 0})</span>
                  <Link to="/business-owner/my-business" className="text-primary-600 hover:underline font-medium">Manage →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}