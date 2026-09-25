import { useEffect, useState } from "react";
import api from "../../services/api";
import { AdminPagination, Badge, ErrorBox, Form, fmtDate, Loading, Modal, Page, Table, Toolbar, toneForStatus } from "./AdminUI";

const categories = ["general", "health", "education", "agriculture", "infrastructure", "water", "electricity", "sanitation", "disaster", "government_scheme", "other"];
const priorities = ["low", "normal", "high", "urgent"];
const fields = [
  { name: "title", label: "Title", required: true, full: true }, { name: "content", label: "Content", type: "textarea", required: true, full: true },
  { name: "category", label: "Category", options: categories.map((x) => ({ value: x, label: x.replaceAll("_", " ") })), required: true },
  { name: "priority", label: "Priority", options: priorities.map((x) => ({ value: x, label: x })), required: true },
  { name: "publishedAt", label: "Publish date", type: "datetime-local" }, { name: "expiresAt", label: "Expiry date", type: "datetime-local" },
];

export default function Notices() {
  const [rows, setRows] = useState([]); const [pagination, setPagination] = useState(null); const [page, setPage] = useState(1); const [search, setSearch] = useState(""); const [category, setCategory] = useState(""); const [priority, setPriority] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [modal, setModal] = useState(null);
  const load = async () => { setLoading(true); setError(""); try { const response = await api.get("/notices", { params: { page, limit: 10, search: search || undefined, category: category || undefined, priority: priority || undefined } }); setRows(response.data?.data?.notices || []); setPagination(response.data?.pagination || null); } catch (err) { setError(err.response?.data?.message || "Failed to load notices"); } finally { setLoading(false); } };
  useEffect(() => { setPage(1); }, [search, category, priority]); useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [page, search, category, priority]);
  const save = async (form) => { const data = { ...form, publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined, expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null }; try { if (modal?.item) await api.put(`/notices/${modal.item._id}`, data); else await api.post("/notices", data); setModal(null); await load(); } catch (err) { setError(err.response?.data?.message || "Save failed"); } };
  const remove = async (id) => { if (!window.confirm("Deactivate this notice?")) return; try { await api.delete(`/notices/${id}`); await load(); } catch (err) { setError(err.response?.data?.message || "Delete failed"); } };
  const initial = (item) => item ? { ...item, publishedAt: item.publishedAt?.slice(0, 16) || "", expiresAt: item.expiresAt?.slice(0, 16) || "" } : { category: "general", priority: "normal" };
  return <Page title="Notices" subtitle="Live village notices with category, priority and publication controls.">
    <Toolbar search={search} setSearch={setSearch} placeholder="Search notices..." filters={<><select className="input" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((x) => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}</select><select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}><option value="">All priorities</option>{priorities.map((x) => <option key={x} value={x}>{x}</option>)}</select></>} onRefresh={load} />
    <div className="flex justify-end"><button className="btn-primary" onClick={() => setModal({ item: null })} type="button">+ Add Notice</button></div>
    {error ? <ErrorBox message={error} retry={load} /> : null}
    {loading ? <Loading /> : <Table rows={rows} columns={[{ key: "title", label: "Notice", render: (row) => <div className="max-w-md"><p className="font-medium">{row.title}</p><p className="line-clamp-2 text-xs text-gray-500">{row.content}</p></div> }, { key: "category", label: "Category", render: (row) => <Badge>{row.category}</Badge> }, { key: "priority", label: "Priority", render: (row) => <Badge tone={toneForStatus(row.priority === "urgent" ? "rejected" : row.priority)}>{row.priority}</Badge> }, { key: "publishedAt", label: "Published", render: (row) => fmtDate(row.publishedAt) }, { key: "viewCount", label: "Views", render: (row) => row.viewCount || 0 }, { key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><button className="btn-secondary" onClick={() => setModal({ item: row })} type="button">Edit</button><button className="btn-danger" onClick={() => remove(row._id)} type="button">Deactivate</button></div> }]} />}
    <AdminPagination pagination={pagination} onPageChange={setPage} />
    {modal ? <Modal title={modal.item ? "Edit Notice" : "Create Notice"} onClose={() => setModal(null)} wide><Form fields={fields} initial={initial(modal.item)} onSubmit={save} submitLabel={modal.item ? "Update" : "Publish"} onCancel={() => setModal(null)} /></Modal> : null}
  </Page>;
}
