import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../../services/dashboardService";
import { AdminPagination, Badge, ErrorBox, fmtDate, Loading, Page, StatCard, Table, toneForStatus } from "./AdminUI";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const response = await getAdminDashboard();
      setData(response.data?.data || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  if (loading && !data) return <Page title="Admin Dashboard"><Loading text="Loading live dashboard..." /></Page>;
  if (error && !data) return <Page title="Admin Dashboard"><ErrorBox message={error} retry={load} /></Page>;

  const overview = data?.overview || {};
  const recent = data?.recent || {};

  return (
    <Page
      title="Admin Dashboard"
      subtitle="Live overview of the Smart Village Management system. Auto-refreshes every 30 seconds."
      actions={<><button className="btn-secondary" onClick={load} type="button">↻ Refresh now</button><Link className="btn-primary" to="/admin/complaints">Review Complaints</Link></>}
    >
      {error ? <ErrorBox message={error} retry={load} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="👥" label="Total Users" value={overview.totalUsers} hint={`+${overview.newUsersThisMonth || 0} this month`} />
        <StatCard icon="📋" label="Complaints" value={overview.totalComplaints} tone="yellow" hint={`${overview.pendingComplaints || 0} pending`} />
        <StatCard icon="🏪" label="Businesses" value={overview.totalBusinesses} tone="green" hint={`${overview.pendingBusinesses || 0} pending review`} />
        <StatCard icon="💼" label="Active Jobs" value={overview.activeJobs} tone="purple" hint={`${overview.totalJobs || 0} total jobs`} />
        <StatCard icon="📢" label="Active Notices" value={overview.activeNotices} hint={`${overview.totalNotices || 0} total notices`} />
        <StatCard icon="📅" label="Upcoming Events" value={overview.upcomingEvents} tone="blue" hint={`${overview.totalEvents || 0} total events`} />
        <StatCard icon="💬" label="Community Posts" value={overview.totalPosts} tone="purple" />
        <StatCard icon="✅" label="Resolved Complaints" value={overview.resolvedComplaints} tone="green" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Recent complaints</h2><Link className="text-sm text-primary-600" to="/admin/complaints">View all</Link></div>
          <Table rows={recent.complaints || []} columns={[
            { key: "title", label: "Complaint", render: (row) => <div><p className="font-medium">{row.title}</p><p className="text-xs text-gray-500">{row.submittedBy?.name || "Unknown"}</p></div> },
            { key: "status", label: "Status", render: (row) => <Badge tone={toneForStatus(row.status)}>{row.status?.replaceAll("_", " ")}</Badge> },
            { key: "createdAt", label: "Date", render: (row) => fmtDate(row.createdAt) },
          ]} />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Recently joined users</h2><Link className="text-sm text-primary-600" to="/admin/users">View all</Link></div>
          <Table rows={recent.users || []} columns={[
            { key: "name", label: "User", render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-gray-500">{row.email}</p></div> },
            { key: "role", label: "Role", render: (row) => <Badge tone="blue">{row.role?.replaceAll("_", " ")}</Badge> },
            { key: "createdAt", label: "Joined", render: (row) => fmtDate(row.createdAt) },
          ]} />
        </div>
      </div>
    </Page>
  );
}
