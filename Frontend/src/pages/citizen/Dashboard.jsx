import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getCitizenDashboard } from "../../services/dashboardService";
import { deleteComplaint } from "../../services/complaintService";
import ComplaintCard from "../../components/complaints/ComplaintCard";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import useAuth from "../../hooks/useAuth";
import {
  QuickAccessGrid,
  MandiWidget,
  GramSabhaCard,
  NoticesWidget,
  EventsWidget,
  FamilyCard,
  HelplineWidget,
} from "../../components/citizen/DashboardSections";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getCitizenDashboard()
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await deleteComplaint(confirmTarget._id);
      toast.success("Complaint deleted");
      setStats((prev) => {
        const wasResolved = confirmTarget.status === "resolved";
        const wasPending = confirmTarget.status === "pending";
        return {
          ...prev,
          complaints: {
            ...prev.complaints,
            total: Math.max(0, (prev.complaints.total || 0) - 1),
            pending: wasPending ? Math.max(0, (prev.complaints.pending || 0) - 1) : prev.complaints.pending,
            resolved: wasResolved ? Math.max(0, (prev.complaints.resolved || 0) - 1) : prev.complaints.resolved,
          },
          recentComplaints: prev.recentComplaints.filter((c) => c._id !== confirmTarget._id),
        };
      });
      setConfirmTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete complaint");
    } finally {
      setDeleting(false);
    }
  };

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
        <Link to="/citizen/applications" className="card p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-gray-500 mb-1">Yojana / Seva Applications</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.featureApplications?.total ?? 0}</p>
        </Link>
        <Link to="/citizen/applications" className="card p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-gray-500 mb-1">Applications In Process</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.featureApplications?.pending ?? 0}</p>
        </Link>
        <Link to="/citizen/applications" className="card p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-gray-500 mb-1">Applications Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.featureApplications?.approved ?? 0}</p>
        </Link>
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-1">Family Members</p>
          <p className="text-2xl font-bold text-primary-600">{stats.household?.memberCount ?? 0}</p>
        </div>
      </div>

      <QuickAccessGrid />

      <div className="grid gap-4 lg:grid-cols-2">
        <MandiWidget prices={stats.mandiPrices || []} />
        <GramSabhaCard meeting={stats.nextGramSabha} />
        <NoticesWidget notices={stats.latestNotices || []} />
        <EventsWidget events={stats.upcomingEvents || []} />
        <FamilyCard household={stats.household} />
        <HelplineWidget contacts={stats.emergencyContacts || []} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/citizen/complaints/create" className="btn-primary">📋 File a Complaint</Link>
        <Link to="/citizen/posts" className="btn-secondary">💬 Community Posts</Link>
        <Link to="/citizen/applications" className="btn-secondary">🌾 My Yojana Applications</Link>
        <Link to="/citizen/job-applications" className="btn-secondary">💼 My Job Applications</Link>
        <Link to="/jobs" className="btn-secondary">💼 Browse Jobs</Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Complaints</h2>
        {stats.recentComplaints.length === 0 ? (
          <EmptyState icon="📋" title="No complaints yet" description="File your first complaint to see it here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.recentComplaints.map((c) => (
              <ComplaintCard key={c._id} complaint={c} onDelete={setConfirmTarget} />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDelete}
        title="Delete Complaint"
        message="Are you sure you want to delete this complaint? This is permanent, even if it is already in progress or resolved."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}