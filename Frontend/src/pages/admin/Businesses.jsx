import { useEffect, useState } from "react";
import api from "../../services/api";
import { AdminPagination, Badge, ErrorBox, Form, Loading, Modal, Page, Table, Toolbar, toneForStatus } from "./AdminUI";

const statuses = ["pending", "approved", "rejected", "suspended"];
const categories = ["grocery", "restaurant", "medical", "hardware", "clothing", "electronics", "agriculture", "dairy", "transport", "education", "beauty", "repair", "other"];

export default function Businesses() {
  const [rows, setRows] = useState([]); const [pagination, setPagination] = useState(null); const [page, setPage] = useState(1); const [status, setStatus] = useState(""); const [category, setCategory] = useState(""); const [search, setSearch] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [selected, setSelected] = useState(null);
  const load = async () => { setLoading(true); setError(""); try { const response = await api.get("/businesses/admin/all", { params: { page, limit: 10, status: status || undefined, category: category || undefined, search: search || undefined } }); setRows(response.data?.data?.businesses || []); setPagination(response.data?.pagination || null); } catch (err) { setError(err.response?.data?.message || "Failed to load businesses"); } finally { setLoading(false); } };
  useEffect(() => { setPage(1); }, [status, category, search]); useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [page, status, category, search]);
  const review = async (form) => { try { await api.patch(`/businesses/${selected._id}/review`, form); setSelected(null); await load(); } catch (err) { setError(err.response?.data?.message || "Review failed"); } };
  return <Page title="Businesses" subtitle="Live business registry with category/status filters and admin review.">
    <Toolbar search={search} setSearch={setSearch} placeholder="Search business..." filters={<><select className="input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{statuses.map((x) => <option key={x} value={x}>{x}</option>)}</select><select className="input" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((x) => <option key={x} value={x}>{x}</option>)}</select></>} onRefresh={load} />
    {error ? <ErrorBox message={error} retry={load} /> : null}
    {loading ? <Loading /> : <Table rows={rows} columns={[
      { key: "name", label: "Business", render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-gray-500">{row.category}</p></div> },
      { key: "owner", label: "Owner", render: (row) => <div><p>{row.owner?.name || "—"}</p><p className="text-xs text-gray-500">{row.owner?.phone || row.owner?.email}</p></div> },
      { key: "status", label: "Status", render: (row) => <Badge tone={toneForStatus(row.status)}>{row.status}</Badge> },
      { key: "rating", label: "Rating", render: (row) => `${row.rating?.average || 0} ★ (${row.rating?.count || 0})` },
      { key: "isFeatured", label: "Featured", render: (row) => <Badge tone={row.isFeatured ? "green" : "gray"}>{row.isFeatured ? "Yes" : "No"}</Badge> },
      { key: "actions", label: "Actions", render: (row) => <button className="btn-primary" onClick={() => setSelected(row)} type="button">Review</button> },
    ]} />}
    <AdminPagination pagination={pagination} onPageChange={setPage} />
    {selected ? <Modal title={`Review ${selected.name}`} onClose={() => setSelected(null)}><Form fields={[{ name: "status", label: "Decision", options: statuses.map((x) => ({ value: x, label: x })), required: true }, { name: "rejectionReason", label: "Reason (optional)", type: "textarea", full: true }]} initial={{ status: selected.status || "pending", rejectionReason: selected.rejectionReason || "" }} onSubmit={review} submitLabel="Save review" onCancel={() => setSelected(null)} /></Modal> : null}
  </Page>;
}
