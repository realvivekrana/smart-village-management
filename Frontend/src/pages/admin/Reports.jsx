import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../services/dashboardService";
import { Badge, ErrorBox, Loading, Page, StatCard } from "./AdminUI";

function Bars({ title, data }) {
  const items = Array.isArray(data) ? data : [];
  const max = Math.max(...items.map((item) => Number(item.count) || 0), 1);
  return <div className="card p-5"><h2 className="mb-4 font-semibold">{title}</h2>{items.length ? <div className="space-y-3">{items.map((item) => { const count = Number(item.count) || 0; const width = Math.max(4, (count / max) * 100); return <div key={String(item._id)}><div className="mb-1 flex justify-between text-xs"><span className="capitalize">{String(item._id).replaceAll("_", " ")}</span><b>{count}</b></div><div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700"><div className="h-2 rounded-full bg-primary-600" style={{ width: `${width}%` }} /></div></div>; })}</div> : <p className="text-sm text-gray-500">No data available.</p>}</div>;
}

export default function Reports() {
  const [data, setData] = useState(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const load = async () => { setError(""); try { const response = await getAdminDashboard(); setData(response.data?.data || {}); } catch (err) { setError(err.response?.data?.message || "Failed to load reports"); } finally { setLoading(false); } };
  useEffect(() => { load(); const timer = setInterval(load, 60000); return () => clearInterval(timer); }, []);
  if (loading && !data) return <Page title="Reports"><Loading /></Page>;
  if (error && !data) return <Page title="Reports"><ErrorBox message={error} retry={load} /></Page>;
  const overview = data?.overview || {}; const charts = data?.charts || {};
  return <Page title="Reports" subtitle="Live operational analytics from the backend. Auto-refreshes every 60 seconds." actions={<button className="btn-secondary" onClick={load} type="button">↻ Refresh</button>}>
    {error ? <ErrorBox message={error} retry={load} /> : null}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard icon="📋" label="Total complaints" value={overview.totalComplaints} /><StatCard icon="🏪" label="Approved businesses" value={overview.approvedBusinesses} tone="green" /><StatCard icon="👥" label="New users (30 days)" value={overview.newUsersThisMonth} tone="purple" /><StatCard icon="📢" label="Active notices" value={overview.activeNotices} /></div>
    <div className="grid gap-6 lg:grid-cols-3"><Bars title="Complaints by category" data={charts.complaintsByCategory} /><Bars title="Complaints by status" data={charts.complaintsByStatus} /><Bars title="Users by role" data={charts.usersByRole} /></div>
    <div className="card p-5"><h2 className="mb-3 font-semibold">Live report scope</h2><div className="flex flex-wrap gap-2 text-sm"><Badge tone="blue">Users</Badge><Badge>Complaints</Badge><Badge>Businesses</Badge><Badge>Jobs</Badge><Badge>Notices</Badge><Badge>Events</Badge><Badge>Community</Badge></div><p className="mt-3 text-xs text-gray-500">All numbers and charts are generated from the current backend database.</p></div>
  </Page>;
}
