import { useEffect, useState } from "react";
import api from "../../services/api";
import { AdminPagination, Badge, ErrorBox, Field, fmtDate, Loading, Modal, Page, Table, Toolbar, toneForStatus } from "./AdminUI";

const statuses = ["pending", "in_progress", "resolved", "rejected", "closed"];
const categories = ["road", "water", "electricity", "sanitation", "health", "education", "agriculture", "security", "noise", "environment", "other"];
const priorities = ["low", "medium", "high", "urgent"];

export default function Complaints() {
  const [rows, setRows] = useState([]); const [pagination, setPagination] = useState(null); const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [status, setStatus] = useState(""); const [category, setCategory] = useState(""); const [priority, setPriority] = useState(""); const [search, setSearch] = useState(""); const [selected, setSelected] = useState(null); const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try { const response = await api.get("/complaints", { params: { page, limit: 10, status: status || undefined, category: category || undefined, priority: priority || undefined, search: search || undefined } }); setRows(response.data?.data?.complaints || []); setPagination(response.data?.pagination || null); }
    catch (err) { setError(err.response?.data?.message || "Failed to load complaints"); } finally { setLoading(false); }
  };
  useEffect(() => { setPage(1); }, [status, category, priority, search]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [page, status, category, priority, search]);

  const saveStatus = async (form) => {
    setSaving(true);
    try { await api.patch(`/complaints/${selected._id}/status`, { status: form.status, note: form.note, adminNote: form.note }); setSelected(null); await load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to update complaint"); } finally { setSaving(false); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    try { await api.delete(`/complaints/${id}`); await load(); } catch (err) { setError(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <Page title="Complaints" subtitle="Live citizen complaints with workflow filters and instant status updates.">
      <Toolbar search={search} setSearch={setSearch} placeholder="Search complaints..." filters={<><select className="input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{statuses.map((x) => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}</select><select className="input" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((x) => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}</select><select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}><option value="">All priority</option>{priorities.map((x) => <option key={x} value={x}>{x}</option>)}</select></>} onRefresh={load} />
      {error ? <ErrorBox message={error} retry={load} /> : null}
      {loading ? <Loading /> : <Table rows={rows} columns={[
        { key: "title", label: "Complaint", render: (row) => <div className="max-w-sm"><p className="font-medium">{row.title}</p><p className="line-clamp-2 text-xs text-gray-500">{row.description}</p><p className="mt-1 text-xs text-gray-400">{row.location || "No location"}</p></div> },
        { key: "submittedBy", label: "Citizen", render: (row) => <div><p>{row.submittedBy?.name || "—"}</p><p className="text-xs text-gray-500">{row.submittedBy?.phone || row.submittedBy?.email}</p></div> },
        { key: "category", label: "Category", render: (row) => <Badge>{row.category}</Badge> },
        { key: "priority", label: "Priority", render: (row) => <Badge tone={row.priority === "urgent" ? "red" : row.priority === "high" ? "yellow" : "gray"}>{row.priority}</Badge> },
        { key: "status", label: "Status", render: (row) => <Badge tone={toneForStatus(row.status)}>{row.status?.replaceAll("_", " ")}</Badge> },
        { key: "createdAt", label: "Date", render: (row) => fmtDate(row.createdAt) },
        { key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><button className="btn-primary" onClick={() => setSelected(row)} type="button">Update</button><button className="btn-danger" onClick={() => remove(row._id)} type="button">Delete</button></div> },
      ]} />}
      <AdminPagination pagination={pagination} onPageChange={setPage} />
      {selected ? <Modal title={`Update: ${selected.title}`} onClose={() => setSelected(null)}><ComplaintForm item={selected} onSave={saveStatus} saving={saving} onCancel={() => setSelected(null)} /></Modal> : null}
    </Page>
  );
}

function ComplaintForm({ item, onSave, saving, onCancel }) {
  const [form, setForm] = useState({ status: item.status || "pending", note: item.adminNote || "" });
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  return <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(form); }}><Field label="Status" value={form.status} onChange={(value) => set("status", value)} options={statuses.map((x) => ({ value: x, label: x.replaceAll("_", " ") }))} /><Field label="Admin note" type="textarea" value={form.note} onChange={(value) => set("note", value)} placeholder="Add an update for the citizen" /><div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button><button className="btn-primary" disabled={saving} type="submit">{saving ? "Saving..." : "Save status"}</button></div></form>;
}
