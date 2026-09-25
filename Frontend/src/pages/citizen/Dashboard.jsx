import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCitizenDashboard } from "../../services/dashboardService";
import ComplaintCard from "../../components/complaints/ComplaintCard";
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
    getCitizenDashboard()
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
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your account.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-1">Total Complaints</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.complaints.total}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-1">Pending Complaints</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.complaints.pending}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-1">Resolved Complaints</p>
          <p className="text-2xl font-bold text-green-600">{stats.complaints.resolved}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-1">Job Applications</p>
          <p className="text-2xl font-bold text-primary-600">{stats.applications.total}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/citizen/complaints/create" className="btn-primary">📋 File a Complaint</Link>
        <Link to="/citizen/posts" className="btn-secondary">💬 Community Posts</Link>
        <Link to="/jobs" className="btn-secondary">💼 Browse Jobs</Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Complaints</h2>
        {stats.recentComplaints.length === 0 ? (
          <EmptyState icon="📋" title="No complaints yet" description="File your first complaint to see it here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.recentComplaints.map((c) => <ComplaintCard key={c._id} complaint={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}